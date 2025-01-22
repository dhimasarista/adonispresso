import Order from '#models/order'
import OrderItem from '#models/order_item';
import Product from '#models/product';
import { uuidv7 } from 'uuidv7';

export class OrderService {
  public async getOrderStatistics() {
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
  public async getOrderWithItems(offset: number, length: number, search: string) {
    const ordersQuery = Order.query().preload("orderItems", (query) => {
      query.preload("product", (subQuery) => {
        subQuery.select("id", "name")
      })
    })

    if (search) {
      ordersQuery.where('total_amount', 'LIKE', "%$search%")
    }

    const orders = await ordersQuery.orderBy("created_at", "desc")
      .limit(length)
      .offset(offset)

    const total = await Order.query().count("*") // data ["count(*"]
    return {
      recordsTotal: total[0].$extras["count(*)"], // Total semua records tanpa filter
      recordsFiltered: total[0].$extras["count(*)"], // Bisa disesuaikan jika ada filter
      data: orders
    }
  }

  public async createOrder(data: any) {
    const orderId = uuidv7(); // Generate UUID untuk order
    let totalAmount = 0;

    // Buat order baru
    const order = await Order.create({
      id: orderId,
      status: "pending",
      totalAmount: 0, // Awalnya 0, akan diupdate setelah menghitung totalAmount
      transactionToken: "",
    });

    // Pastikan order berhasil dibuat dan disimpan
    if (!order.$isPersisted) {
      throw new Error("Failed to create order");
    }

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
        order_id: orderId, // Pastikan order_id sesuai dengan order yang dibuat
        product_id: productExist.id,
        created_at: new Date(),
        updated_at: new Date(),
      });
    });

    // Tambahkan item ke tabel order_items
    await OrderItem.createMany(orderItems);

    // Update totalAmount pada order setelah semua item ditambahkan
    order.totalAmount = totalAmount;
    await order.save();

    return {
      order,
      orderItems,
    };
  }

}
