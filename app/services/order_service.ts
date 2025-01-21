import Order from '#models/order'
import db from '@adonisjs/lucid/services/db'

export class OrderService {

  public async getOrderWithItems(){
    // db.from("orders")
    // .join("order_items", "order_id", "=", "order_items.id")
    // .join("products", "product_id", "=", "products.id")
    // .select([
    //   "orders.id AS order_id",
    //   "orders.status",
    //   "orders.total_amount",
    //   "orders.transaction_token",
    //   "orders.created_at",
    //   "orders.updated_at",
    //   "orders.deleted_at",
    //   "products.id AS product_id",
    //   "products.name AS product_name"
    // ])

    const orders = await Order.query().preload("orderItems")
    .orderBy("created_at", "desc")
    // .paginate()


    return orders;
  }
}
