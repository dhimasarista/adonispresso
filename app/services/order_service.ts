import Order from '#models/order'
import OrderItem from '#models/order_item';
import Product from '#models/product';
import { uuidv7 } from 'uuidv7';
import db from '@adonisjs/lucid/services/db'
import Formatting from '../utilities/formatting.js';
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
      const statistics = orders[0].$extras;
    return {
      total: Formatting.formatNumberWithDots(statistics.total),
      totalOrder: Formatting.formatNumberWithDots(statistics.total_order),
      success: Formatting.formatNumberWithDots(statistics.success),
      pending: Formatting.formatNumberWithDots(statistics.pending),
      cancel: Formatting.formatNumberWithDots(statistics.cancel),
    };
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
    let totalAmount = 0;
    let orderId = 0;

    await db.transaction(async trx => {
      const order = await Order.create({
        status: "pending",
        totalAmount: 0, // value awal
        transactionToken: "",
      }, { client: trx })

      // Pastikan order berhasil dibuat dan disimpan
      if (!order.$isPersisted) throw new Error("failed to create order");
      orderId = order.$attributes.id;


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
        // mencari produk sesuai id yang dikirim client
        const productExist = productArray.find((p: any) => {
          return p.id === product["product_id"]
        });

        // jika produk tidak ditemukan, throw error
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
          order_id: order.$attributes.id,
          product_id: productExist.id,
        });
      });

      // Tambahkan item ke tabel order_items
      await OrderItem.createMany(orderItems, {
        client: trx
      });

      // Update totalAmount pada order setelah semua item ditambahkan
      order.totalAmount = totalAmount;
      await order.save();

      await trx.commit()

    })
    return orderId;
  }

}
