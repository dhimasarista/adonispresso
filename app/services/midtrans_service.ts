import env from "#start/env";
import { ServerError } from "../utilities/error_handling.js";
import logger from '@adonisjs/core/services/logger';
// @ts-ignore
import midtransClient from "midtrans-client";

export class MidtransService {
  private snap: midtransClient.Snap;
  private serverKey: string = env.get('MIDTRANS_SERVER_KEY') ?? "";
  constructor(){
    this.snap = new midtransClient.Snap({
      isProduction: env.get('MIDTRANS_ENV') === 'production',
      serverKey: this.serverKey,
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
  async checkStatus(orderId: string) {
    let status = null;
    let response = null;
    const url: string = `https://api.sandbox.midtrans.com/v2/${orderId}/status`;
    const auth = Buffer.from(this.serverKey).toString("base64");

    try {
      const fetchResponse = await fetch(url, {
        method: "GET",
        headers: {
          Authorization: `Basic ${auth}`
        }
      });

      if (!fetchResponse.ok) {
        throw new Error("Failed to fetch transaction status");
      }

      const result = await fetchResponse.json() as { transaction_status: string, fraud_status: string };
      response = result;
    } catch (error) {
      console.error("Error occurred while checking status:", error);
      throw new Error("Internal Server Error");
    }
    const transactionStatus = response.transaction_status;
    if (transactionStatus != null) {
      // set transaction status based on response from check transaction status
      if (transactionStatus === "capture") {
        if (response.fraud_status === "challenge") {
          // TODO set transaction status on your database to 'challenge'
          // e.g: 'Payment status challenged. Please take action on your Merchant Administration Portal
          status = "challenged";
        } else if (response.fraud_status === "accept") {
          // TODO set transaction status on your database to 'success'
          status = "success";
        }
      } else if (transactionStatus === "settlement") {
        // TODO set transaction status on your database to 'success'
        status = "success";
      } else if (transactionStatus === "deny") {
        // TODO you can ignore 'deny', because most of the time it allows payment retries
        // and later can become success
        status = "deny";
      } else if (transactionStatus === "cancel" || transactionStatus === "expire") {
        // TODO set transaction status on your database to 'failure'
        status = "cancel";
      } else if (transactionStatus === "pending") {
        // TODO set transaction status on your database to 'pending' / waiting payment
        status = "waiting";
      }
    } else {
      status = "cancel";
    }
    return status;
  }
}
