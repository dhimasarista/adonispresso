import { OrderService } from '#services/order_service';
import env from '#start/env';
import { inject } from '@adonisjs/core';
import type { HttpContext } from '@adonisjs/core/http'

@inject()
export default class OrdersController {
    constructor(protected orderService: OrderService){}
    /**
     * Display a list of resource
     */
    async render({view}: HttpContext){
      let orders = null;
      let error = null;
      try {
        orders = await this.orderService.getOrderStatistics()
      } catch (err) {
        if (err instanceof Error) {
          console.error(err.message);
          if (env.get("NODE_ENV", "development")) {
            error = {
              message: err.message,
              code: 500
            }
          }
        }
      } finally {
        return view.render("pages/list_order", {
          orders, error
        })
      }
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
