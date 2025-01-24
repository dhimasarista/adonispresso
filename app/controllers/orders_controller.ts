import { OrderService } from '#services/order_service';
import { ProductService } from '#services/product_service';
import env from '#start/env';
import { inject } from '@adonisjs/core';
import type { HttpContext } from '@adonisjs/core/http'
import logger from '@adonisjs/core/services/logger';
@inject()
export default class OrdersController {
    constructor(
      protected orderService: OrderService,
      protected productService: ProductService
    ){}
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
        orders = await this.orderService.getOrderStatistics()
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

    async renderNewOrder({view, response}: HttpContext){
      const products = await this.productService.list()
      return view.render("pages/new_order", {
        products
      })
    }

    async create({request, response}: HttpContext) {
      try {
        const order = await this.orderService.createOrder(request.body())
        return response.status(200).json({
          message: `success create order ${order}`
        })
      } catch (error) {
        if (error instanceof Error) {
          console.error(error.stack);
          return response.status(500).json({
            message: "internal server error"
          });
        }
      }
    }

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
        if (error instanceof Error) {
          console.error(error.message);
          return response.status(500).json({
            message: "internal server error"
          });
        }
      }
    }
}
