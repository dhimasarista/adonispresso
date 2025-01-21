import Order from '#models/order'

export class OrderService {

  public async getOrderWithItems(){
    const orders = await Order.query().preload("orderItems")
    .orderBy("created_at", "desc")
    // .paginate();


    return orders;
  }
}
