import Order from '#models/order'
import OrderItem from '#models/order_item';
import Product from '#models/product';
import { uuidv7 } from 'uuidv7';
import db from '@adonisjs/lucid/services/db'
import Formatting from '../utilities/formatting.js';
import { ClientError, ServerError } from '../utilities/error_handling.js';
import logger from '@adonisjs/core/services/logger';
import { MidtransService } from './midtrans_service.js';
import { inject } from '@adonisjs/core'
import { errors as lucidErrors } from '@adonisjs/lucid';
@inject()
export class OrderService {
  constructor(public midtrans: MidtransService) { }
  public async getOrderStatistics() {
    try {
      const orders = await Order.query()
        .select(
          Order.query().count("id").as("total_order"), // Menghitung semua order tanpa filter status
          Order.query().sum("total_amount").where("status", "success").as("total"), // Sum hanya untuk status success
          Order.query().count("*").where("status", "success").as("success"), // Count status success
          Order.query().count("*").where("status", "pending").as("pending"), // Count status pending
          Order.query().count("*").where("status", "cancel").as("cancel") // Count status cancel
        );
      const statistics = orders[0].$extras ?? 0;
      return {
        total: Formatting.formatNumberWithDots(statistics.total ?? 0),
        totalOrder: Formatting.formatNumberWithDots(statistics.total_order ?? 0),
        success: Formatting.formatNumberWithDots(statistics.success ?? 0),
        pending: Formatting.formatNumberWithDots(statistics.pending ?? 0),
        cancel: Formatting.formatNumberWithDots(statistics.cancel ?? 0),
      };
    } catch (error) {
      if (error instanceof ClientError) {
        throw error;
      }
      logger.error(error)
      throw new ServerError('Internal server error', 500);
    }
  }

  public async getOrderWithItems(offset: number, length: number, search: string) {
    try {
      const ordersQuery = Order.query().preload("orderItems", (query) => {
        query.preload("product", (subQuery) => {
          subQuery.select("id", "name")
        })
      });

      if (search) {
        ordersQuery.where('status', 'LIKE', `%${search}%`);
      }

      const orders = await ordersQuery.orderBy("created_at", "desc")
        .limit(length)
        .offset(offset);

      const total = await Order.query().count("*");
      return {
        recordsTotal: total[0].$extras["count(*)"],
        recordsFiltered: total[0].$extras["count(*)"],
        data: orders
      };
    } catch (error) {
      if (error instanceof ClientError) {
        throw error;
      }
      throw new ServerError('Internal server error', 500);
    }
  }

  public async createOrder(data: any) {
    try {
      let totalAmount = 0;
      let orderId = null;
      let transactionToken = null;

      // start db transaction
      await db.transaction(async trx => {
        // create order first
        const order = await Order.create({
          status: "pending",
          totalAmount: 0,
          transactionToken: "",
        }, { client: trx });

        // then assign orderId after create order
        orderId = order.$attributes.id;
        // extract product IDs from the provided data from user request
        const productIds = data["products"].map((value: any) => value["productId"]);
        // query the database to retrieve product details based on the extracted product IDs
        const products = await Product.query()
          .whereIn("id", productIds)
          .exec();
        // convert product to arrray
        const productArray = products.map((product) => product.toJSON());
        // init order item for tampung data
        const orderItems: any = [];
        data["products"].forEach((product: any) => {
          const productExist = productArray.find((p: any) => {
            return p.id === product["productId"]
          });

          if (!productExist) {
            throw new ClientError(`Product with ID ${product["productId"]} not found`, 400);
          }

          const amount = product["quantity"] * productExist.price;
          totalAmount += amount;

          orderItems.push({
            id: uuidv7(),
            quantity: product["quantity"],
            order_id: order.$attributes.id,
            product_id: productExist.id,
          });
        });

        const creatOrderItem = await OrderItem.createMany(orderItems, { client: trx });
        if (creatOrderItem.length !== 0) {
          const createTransaction = await this.midtrans.createTransaction(
            orderId, totalAmount,
            orderItems.map((item: any) => {
              productArray.map(product => {
                if (product.id === item.product_id) {
                  return {
                    "id": product.id,
                    "price": product.price,
                    "quantity": item.quantity,
                    "name": product.name,
                    "brand": "codedhims",
                    // "category": "Fruit",
                    // "merchant_name": "Fruit-store",
                    // "tenor": "12",
                    // "code_plan": "000",
                    // "mid": "123456",
                    // "url": "https://tokobuah.com/apple-fuji"
                  }
                }
              })
            })
          )
          transactionToken = createTransaction.token;
          order.totalAmount = totalAmount;
          order.transactionToken = transactionToken;
          await order.save();
          await trx.commit();
        }
      });

      return { orderId, transactionToken };
    } catch (error) {
      if (error instanceof ClientError) {
        throw error;
      }
      logger.error(error.message);
      throw new ServerError('Internal server error', 500);
    }
  }

  public async checkStatus(orderId: string) {
    try {
      const status = await this.midtrans.checkStatus(orderId);
      if (!status) {
        throw new ClientError("nothing response from midtrans", 401);
      }
      const order = await Order.findOrFail(orderId);
      order.status = status;
      order.save();

      return status;
    } catch (error) {
      if (error instanceof lucidErrors.E_ROW_NOT_FOUND) {
        throw new ClientError(`order ${orderId} not found`, 404);
      }
      if (error instanceof ClientError) {
        throw error;
      }
      logger.error(error.message);
      throw new ServerError('Internal server error', 500);
    }
  }

  public async topSelling() {
    try {
      const products = await OrderItem.query()
        .select(
          "products.id as product_id",
          "products.name as product_name",
          "products.image as product_image",
        )
        // .count("order_items.product_id", "total_orders")
        .sum("order_items.quantity", "total_orders")
        .innerJoin("products", (query) => {
          query.on("order_items.product_id", "=", "products.id")
        })
        .innerJoin("orders", (query) => {
          query.on("order_items.order_id", "=", "orders.id")
        })
        .groupBy("products.id", "products.name")
        .orderBy("total_orders", "desc")
        .limit(10)
        .where("orders.status", "success");

      return products.map((data) => {
        return {
          product_id: data.$original.productId,
          product_name: data.$extras.product_name,
          product_image: data.$extras.product_image,
          total_orders: data.$extras.total_orders,
        };
      });
    } catch (error) {
      if (error instanceof ClientError) {
        throw error;
      }
      logger.error(error.message);
      throw new ServerError('Internal server error', 500);
    }
  }
}
