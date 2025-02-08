import { OrderService } from '#services/order_service';
import { ProductService } from '#services/product_service';
import env from '#start/env';
import { inject } from '@adonisjs/core';
import type { HttpContext } from '@adonisjs/core/http'
import logger from '@adonisjs/core/services/logger';
import { errorResponse } from '../utilities/error_handling.js';
import { Server } from 'socket.io';
import { io } from "#start/ws";
@inject()
export default class OrdersController {
    private io: Server;
    constructor(
      protected orderService: OrderService,
      protected productService: ProductService
    ){
      this.io = io;
    }
    /**
     * Display a list of resource
     */
    async renderListOrder({view}: HttpContext){
      try {
        return view.render("pages/list_order")
      } catch (err) {
        if (err instanceof Error) {
          logger.error({ err: Error }, err.message);
          if (env.get("NODE_ENV", "development")) {
            return view.render("pages/errors/server_error", { error: err })
          }
        }
      }
    }

    async renderOrderStatistics({view}: HttpContext){
      let orders = null;
      let error = null;
      try {
        orders = await this.orderService.getOrderStatistics();
      } catch (err) {
        if (err instanceof Error) {
          logger.error({ err: Error }, err.message);
          if (env.get("NODE_ENV", "development")) {
            error = {
              message: err.message,
              code: 500
            }
          }
        }
      } finally {
        return view.render("components/order_statistics", {
          orders, error
        })
      }
    }

    async renderNewOrder({view}: HttpContext){
      const products = await this.productService.list()
      return view.render("pages/new_order", {
        products
      })
    }
    /**
   * @route POST
   * @description Create a new order
   * @param {Object} request.body - The request body
   * @param {Array} request.body.products - List of products in the order
   * @param {string} request.body.products.product_id - The ID of the product
   * @param {number} request.body.products.quantity - The quantity of the product
   * @returns {object} 201 - The created order object
   * @returns {object} 400 - Bad request if the input data is invalid
   *
   * @example
   * {
   *   "products": [
   *     {
   *       "product_id": "abc123",
   *       "quantity": 2
   *     },
   *     {
   *       "product_id": "xyz456",
   *       "quantity": 1
   *     }
   *   ]
   * }
   */
    async create({request, response}: HttpContext): Promise<void> {
      try {
        const order = await this.orderService.createOrder(request.body());
        this.io.emit("new_order", "new order");
        return response.status(200).json(order);
      } catch (error) {
        errorResponse(error, response);
      }
    }
    /**
   * @route GET
   * @description Get orders with pagination and search
   * @param {number} start - The start index for pagination
   * @param {number} length - The number of records per page
   * @param {string} search - The search term to filter orders
   * @returns {object} 200 - A list of orders with pagination info
   * @returns {object} 400 - Bad request if the inputs are invalid
   */
    async index({response, request}: HttpContext) {
      try {
        const page = request.input("start", 0)
        const perPage = request.input("length", 10)
        const search = request.input("search.value", "")
        const orders = await this.orderService.getOrderWithItems(page, perPage, search)

        // jikq list di query param != true
        // redirect ke order/list
        if (!request.qs()["list"]) {
          return response.redirect("/orders/new")
        }

        return response.status(200).json({
          message: "get orders",
          recordsTotal: orders.recordsTotal,
          recordsFiltered: orders.recordsFiltered,
          orders: orders.data
        });
      } catch (error) {
        errorResponse(error, response);
      }
    }
    public async checkOrderstatus(ctx: HttpContext){
      try {
        const checkStatus = await this.orderService.checkStatus(ctx.request.input("id"))
        return ctx.response.status(200).send(checkStatus);
      } catch (error) {
        errorResponse(error, ctx.response);
      }
    }
    public async topSelling(ctx: HttpContext){
      try {
       const products = await this.orderService.topSelling();
       return ctx.view.render("components/top_selling", {
        products
       })
      } catch (err) {
        if (err instanceof Error) {
          if (env.get("NODE_ENV", "development")) {
            return ctx.view.render("pages/errors/server_error", { error: err })
          }
        }
      }
    }
}
