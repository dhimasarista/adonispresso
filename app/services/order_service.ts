import Order from '#models/order'

export class OrderService {
  public async getOrderStatistics(){
    const orders = await Order.query()
    .sum("total_amount", "total")
    .count("id as total_order")
    .select(
      Order.query().count("*").where("status", "success").as("success"),
      Order.query().count("*").where("status", "pending").as("pending"),
      Order.query().count("*").where("status", "cancel").as("cancel"),
    )

    console.log(orders);


    return orders[0].$extras;
  }
  public async getOrderWithItems(){
    const orders = await Order.query().preload("orderItems")
    .orderBy("created_at", "desc")
    // .paginate();


    return orders;
  }
}
