import { cuid } from '@adonisjs/core/helpers'
import Product from "#models/product";
import { MultipartFile } from '@adonisjs/core/bodyparser';
import drive from '@adonisjs/drive/services/main'
export class ProductService {
  public async list() {
    return await Product.query().select("id", "name", "price", "image", "created_at").whereNull("deleted_at");
  }
  public async uploadImage(image: MultipartFile) {
    const imageName = `${cuid()}.${image.extname}`;
    const key = `products/${imageName}`

    await image.moveToDisk(key);
    // return await drive.use().getUrl(key)
    return imageName;
  }
  public async deleteImage(image: string) {
    const location = `/products/${image}`;
    const d = drive.use("fs");
    try {
      // Cari produk berdasarkan nama gambar
      const product = await Product.findBy("image", image);
      // Periksa apakah file ada di storage
      const exists = await d.exists(location);
      if (product || exists) {
        // Update produk (jika ada) untuk menghapus referensi gambar
        if (product) {
          await product.merge({ image: null }).save();
        }
        // Hapus file di storage (jika ada)
        if (exists) {
          await d.delete(location);
        }
        return true;
      }
      return false;
    } catch (error) {
      throw new Error(error);
    }
  }
}
