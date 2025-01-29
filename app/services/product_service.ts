import { cuid } from '@adonisjs/core/helpers'
import Product from "#models/product";
import { Request } from '@adonisjs/core/http';
import drive from '@adonisjs/drive/services/main'
import { createProductValidator } from '#validators/product';
import { ClientError, ServerError } from '../utilities/error_handling.js';
import logger from '@adonisjs/core/services/logger';
import { errors } from '@vinejs/vine';
import { MultipartFile } from '@adonisjs/core/bodyparser';
import { errors as lucidErrors } from '@adonisjs/lucid';
export class ProductService {
  constructor() { }
  public async list() {
    return await Product.query().select("id", "name", "price", "image", "created_at").orderBy("created_at", "desc").whereNull("deleted_at");
  }
  public async listPaginate(offset: number, length: number, search: string){
    try {
      const productQuery = Product.query().select("id", "name", "image", "price", "created_at")
      .whereNull("deleted_at");

      // mengambil total data di table
      const total = await Product.query().count("* as total");

      if (search) {
        productQuery.where("name", "LIKE", `%${search}%`);
      }
      const products = await productQuery.orderBy("created_at", "desc")
      .limit(length)
      .offset(offset);

      return {
        recordsTotal: total[0].$extras["total"],
        recordsFiltered: total[0].$extras["total"],
        data: products
      };
    } catch (error) {
      if (error instanceof ClientError) {
        throw error;
      }
      logger.error(error.message);
      throw new ServerError('Internal server error', 500);
    }
  }
  public async findById(id: string){
    try {
      const products = await Product.findOrFail(id);
      return {
        "message": `get product ${id}`,
        "data": products,
      }
    } catch (error) {
      if (error instanceof lucidErrors.E_ROW_NOT_FOUND) {
        throw new ClientError(`product ${id} not found`, 404);
      }
      throw new ServerError("internal server error", 500);
    }
  }
  public async createProduct(product: object) {
    try {
      const data = await createProductValidator.validate(product);
      const createdProduct = await Product.create(data)
      return {
        message: "success create product",
        data: createdProduct,
      }
    } catch (error) {
      if (error instanceof errors.E_VALIDATION_ERROR) {
        throw new ClientError(error.message, 400);
      }
      if (error.code === 'ER_DUP_ENTRY') {
        throw new ClientError('duplicate entry for product', 400);
      }
      logger.error(error.message)
      throw new ServerError("internal server error", 500);
    }
  }
  public async updateProduct(id: string, dataUpdate: object){
    try {
      const data = await createProductValidator.validate(dataUpdate)
      const product = await Product.findOrFail(id)
      // update data
      product.name = data.name;
      product.price = data.price;
      if (data.image) product.image = data.image;
      // save it
      await product.save();

      return {
        message: `success update product ${id}`,
      }
    } catch (error) {
      if (error instanceof lucidErrors.E_ROW_NOT_FOUND) {
        throw new ClientError(`product ${id} not found`, 404);
      }
      if (error instanceof errors.E_VALIDATION_ERROR) {
        throw new ClientError(error.message, 400);
      }
      if (error.code === 'ER_DUP_ENTRY') {
        throw new ClientError('duplicate entry for product', 400);
      }
      logger.error(error.message)
      throw new ServerError("internal server error", 500);
    }
  }
  public async uploadImage(request: Request): Promise<string> {
    try {
      // Ambil file dari request
      const image: MultipartFile | null = request.file('filepond', {
        size: '5mb',
        extnames: ['jpeg', 'jpg', 'png'],
      });

      // Jika file tidak ada, lemparkan ClientError
      if (!image) {
        throw new ClientError('image is missing in the request', 400);
      }

      // Pastikan file adalah gambar valid
      if (!image.isValid) {
        throw new ClientError('invalid image file', 400);
      }

      // Generate nama unik untuk gambar
      const imageName = `${cuid()}.${image.extname}`;
      const key = `products/${imageName}`;

      // Pindahkan file ke storage
      await image.moveToDisk(key);
      return imageName;
    } catch (error) {
      // Tangani error dari sisi client
      if (error instanceof ClientError) {
        throw error;
      }

      // Log error dan lemparkan ServerError untuk error internal
      logger.error(error.message);
      throw new ServerError('internal server error', 500);
    }
  }
  public async deleteImage(image: string): Promise<string> {
    const location = `/products/${image}`;
    const driveInstance = drive.use('fs');
    try {
      // Cari produk berdasarkan nama gambar
      const product = await Product.findBy('image', image);
      // Periksa apakah file ada di storage
      const exists = await driveInstance.exists(location);
      if (product || exists) {
        // Update produk (jika ada) untuk menghapus referensi gambar
        if (product) {
          await product.merge({ image: null }).save();
        }
        // Hapus file di storage (jika ada)
        if (exists) {
          await driveInstance.delete(location);
        }
      } else {
        throw new ClientError(`${image} not found`, 404);
      }
      return `Image ${image} was deleted`;
    } catch (error) {
      if (error instanceof ClientError) {
        throw error;
      }
      logger.error(error.message);
      throw new ServerError('Failed to delete image', 500);
    }
  }
}
