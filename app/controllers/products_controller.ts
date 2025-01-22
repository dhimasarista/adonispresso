import type { HttpContext } from '@adonisjs/core/http'
import { ProductService } from "#services/product_service";
import { inject } from "@adonisjs/core";

@inject()
export default class ProductsController {
  constructor(
    protected productService: ProductService
  ){}
  async list({response}: HttpContext){
    const products = await this.productService.list();
    return response.json({
      products
    })
  }
}
