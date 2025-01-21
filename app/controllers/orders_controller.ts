import { OrderService } from '#services/order_service';
import { inject } from '@adonisjs/core';
import type { HttpContext } from '@adonisjs/core/http'

@inject()
export default class OrdersController {
    constructor(protected orderService: OrderService){}
    /**
     * Display a list of resource
     */
    async render({response, view}: HttpContext){
      try {
        return view.render("pages/order", {

        })
      } catch (error) {
        if (error instanceof Error) {
          return view.render("errors/server_error", {
            error: {
              message: error.name,
              code: 500
            }
          })
        }
      }
    }

    async index({response}: HttpContext) {
      try {
        const orders = await this.orderService.getOrderWithItems()
        return response.status(200).json({
          message: "get orders",
          orders: orders
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
