import type { HttpContext } from '@adonisjs/core/http'
import { ProductService } from "#services/product_service";
import { inject } from "@adonisjs/core";
import logger from '@adonisjs/core/services/logger'
import env from '#start/env';
import { errorResponse } from '../utilities/error_handling.js';

@inject()
export default class ProductsController {
  constructor(
    protected productService: ProductService
  ) { }
  async store({response, request}: HttpContext){
    try {
      const data = request.only(["name", "image", "price"])
      const createProduct = await this.productService.createProduct(data)
      return response.status(200).json(createProduct)
    } catch (error) {
      errorResponse(error, response);
    }
  }
  async list({ response }: HttpContext) {
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
  async index({ view }: HttpContext) {
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
  /**
 * @swagger
 * /upload:
 *   post:
 *     summary: Upload an image
 *     description: Upload an image file (JPEG, JPG, PNG) with a size limit of 5MB.
 *     consumes:
 *       - multipart/form-data
 *     parameters:
 *       - in: formData
 *         name: filepond
 *         type: file
 *         description: The image file to upload
 *         required: true
 *     responses:
 *       200:
 *         description: File uploaded successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "File uploaded successfully"
 *       400:
 *         description: Invalid file or no file uploaded
 *       500:
 *         description: Internal server error
 */
  async uploadImage({ request, response }: HttpContext) {
    try {
      const uploadImage = await this.productService.uploadImage(request);
      return response.status(200).send(uploadImage);
    } catch (error) {
      errorResponse(error, response);
    }
  }
  public async deleteImage({ request, response }: HttpContext) {
    try {
      const body = request.only(["image"]);
      const deleteImage = await this.productService.deleteImage(body.image);
      return response.status(200).json({
        message: deleteImage,
      })
    } catch (error) {
      errorResponse(error, response);
    }
  }
}
