import { cuid } from '@adonisjs/core/helpers'
import Product from "#models/product";
import { MultipartFile } from '@adonisjs/core/bodyparser';
export class ProductService{
  public async list(){
    return await Product.query().select("id", "name", "price", "image", "created_at").whereNull("deleted_at");
  }
  public async uploadImage(image: MultipartFile){
    const imageName = `${cuid()}.${image.extname}`;
    const key = `products/${imageName}`

    await image.moveToDisk(key);
    // return await drive.use().getUrl(key)
    return imageName;
  }
}
