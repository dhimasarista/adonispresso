import Order from '#models/order'
import Product from '#models/product';
import { uuidv7 } from 'uuidv7';

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
    return orders[0].$extras;
  }
  public async getOrderWithItems(){
    const orders = await Order.query().preload("orderItems")
    .orderBy("created_at", "desc")
    // .paginate();
    return orders;
  }

  public async createOrder(data: any) {
    const orderId = uuidv7();
    let totalAmount = 0;

    // Buat order baru
    // const order = await Order.create({
    //   id: orderId,
    //   status: "pending",
    //   totalAmount: 0, // Awalnya 0, akan diupdate setelah menghitung totalAmount
    //   transactionToken: "",
    // });

    // // Pastikan order berhasil dibuat
    // if (!order.$isPersisted) throw new Error("Failed to create order");

    // Ambil daftar product_id dari data
    const productIds = data["products"].map((value: any) => value["product_id"]);

    // Query produk dari database
    const products = await Product.query()
      .whereIn("id", productIds)
      .exec();

    // Konversi produk menjadi array JSON
    const productArray = products.map((product) => product.toJSON());

    // Cek apakah semua product_id di data["products"] valid
    const orderItems: any = [];
    data["products"].forEach((product: any) => {
      const productExist = productArray.find(
        (p: any) => p.id === product["product_id"]
      );
      if (!productExist) {
        throw new Error(`Product with ID ${product["product_id"]} not found`);
      }

      // Hitung jumlah total
      const amount = product["quantity"] * productExist.price; // Asumsikan ada kolom "price"
      totalAmount += amount;

      // Siapkan data order item
      orderItems.push({
        id: uuidv7(),
        quantity: product["quantity"],
        order_id: orderId,
        product_id: productExist.id, // Tambahkan referensi ke product_id
      });
    });

    return orderItems;
  }
}
