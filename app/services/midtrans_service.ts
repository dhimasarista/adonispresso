import env from "#start/env";
import { ServerError } from "../utilities/error_handling.js";
import logger from '@adonisjs/core/services/logger';
// @ts-ignore
import midtransClient from "midtrans-client";

export class MidtransService {
  private snap: midtransClient.Snap;

  constructor(){
    this.snap = new midtransClient.Snap({
      isProduction: env.get('MIDTRANS_ENV') === 'production',
      serverKey: env.get('MIDTRANS_SERVER_KEY'),
      clientKey: env.get('MIDTRANS_CLIENT_KEY'),
    });
  }

  async createTransaction(orderId: string, amount: number, items: any[]){
    const parameter = {
      transaction_details: {
        order_id: orderId,
        gross_amount: amount,
      },
      item_details: items,
    }

    try {
      return await this.snap.createTransaction(parameter);
    } catch (error) {
      logger.error(error.message);
      throw new ServerError("internal server error", 500);
    }
  }
}
