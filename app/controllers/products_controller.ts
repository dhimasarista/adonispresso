import type { HttpContext } from '@adonisjs/core/http'
import { ProductService } from "#services/product_service";
import { inject } from "@adonisjs/core";
import logger from '@adonisjs/core/services/logger'
import env from '#start/env';

@inject()
export default class ProductsController {
  constructor(
    protected productService: ProductService
  ){}
  async list({response}: HttpContext){
    try {
      const products = await this.productService.list();
      return response.json({
        products
      });
    } catch (error) {
      if (error instanceof Error) {
        logger.error({ err: Error }, error.message)
        return response.status(500).json({
          message: "internal server error"
        });
      }
    }
  }
  async index({view}: HttpContext){
    try {
      return view.render("pages/list_product", {})
    } catch (err) {
      if (err instanceof Error) {
        logger.error({ err: Error }, err.message);
        if (env.get("NODE_ENV", "development")) {
          return view.render("pages/errors/server_error", { error: err })
        }
      }
    }
  }
}
