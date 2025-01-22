import Product from "#models/product";

export class ProductService{
  public async list(){
    return await Product.query().select("id", "name", "price", "image").whereNull("deleted_at");
  }
}
