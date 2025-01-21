import { OrderService } from '#services/order_service';
import { inject } from '@adonisjs/core';
import type { HttpContext } from '@adonisjs/core/http'

@inject()
export default class OrdersController {
    constructor(protected orderService: OrderService){}
    /**
     * Display a list of resource
     */
    async index({response}: HttpContext) {
      try {
        const orders = this.orderService.getOrderWithItems()
        return response.status(200).json({
          message: "get orders",
          orders
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
