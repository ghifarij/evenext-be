import { Request, Response } from "express";
import prisma from "../prisma";
const midtransClient = require("midtrans-client");
import dotenv from "dotenv";
dotenv.config();

export class OrderController {
  async createOrder(req: Request, res: Response) {
    try {
      const customerId = req.user?.id!;
      const { totalPrice, finalPrice, orderCart } = req.body;
      const expiredAt = new Date(new Date().getTime() + 10 * 60 * 1000);

      // Create the order
      const { id } = await prisma.order.create({
        data: {
          userId: customerId,
          total_price: totalPrice,
          final_price: finalPrice,
          expiredAt,
          status: "Pending",
        },
      });

      // Process each item in the order cart
      for (const order of orderCart) {
        const ticket = await prisma.ticket.findUnique({
          where: { id: order.ticket.id },
        });

        if (!ticket) {
          throw new Error(`Ticket with ID ${order.ticket.id} not found`);
        }

        const subTotalPrice = ticket.price * order.quantity;

        // Create order details
        await prisma.order_Details.create({
          data: {
            orderId: id,
            ticketId: order.ticket.id,
            qty: order.quantity,
          },
        });

        // Decrease ticket quantity
        await prisma.ticket.update({
          where: { id: order.ticket.id },
          data: { seats: { decrement: order.quantity } },
        });
      }

      res
        .status(201)
        .send({ message: "Order created successfully", orderId: id });
    } catch (error) {
      console.error(error);
      res.status(400).send({ error: "Failed to create order", details: error });
    }
  }

  async getOrderDetail(req: Request, res: Response) {
    try {
      const order = await prisma.order.findUnique({
        where: { id: parseInt(req.params.orderId) },
        include: {
          Order_Details: {
            include: {
              ticket: {
                include: {
                  event: true,
                },
              },
            },
          },
        },
      });

      if (!order) {
        throw new Error("Order not found");
      }

      res.status(200).send(order);
    } catch (err) {
      console.error(err);
      res.status(400).send({ message: err });
    }
  }

  async getOrderToken(req: Request, res: Response) {
    try {
      const { order_id } = req.body;

      const activeOrder = await prisma.order.findUnique({
        where: { id: order_id },
      });

      if (!activeOrder || activeOrder.status === "Cancel") {
        throw new Error("Order is not active or has been canceled.");
      }

      const orderDetails = await prisma.order_Details.findMany({
        where: { orderId: order_id },
        include: { ticket: true },
      });

      const customer = await prisma.user.findUnique({
        where: { id: activeOrder.userId },
      });

      const snap = new midtransClient.Snap({
        isProduction: false,
        serverKey: process.env.MIDTRANS_SERVER_KEY,
      });

      const items = orderDetails.map((detail) => ({
        id: detail.ticketId.toString(),
        name: detail.ticket.category,
        price: detail.ticket.price,
        quantity: detail.qty,
      }));

      const parameter = {
        transaction_details: {
          order_id: order_id.toString(),
          gross_amount: activeOrder.final_price,
        },
        customer_details: {
          first_name: customer?.username,
          email: customer?.email,
        },
        item_details: items,
        expiry: {
          unit: "minutes",
          duration: Math.ceil(
            (new Date(activeOrder.expiredAt).getTime() - new Date().getTime()) /
              60000
          ),
        },
      };

      const transaction = await snap.createTransaction(parameter);

      res.status(200).send({ orderToken: transaction.token });
    } catch (err) {
      console.error(err);
      res.status(400).send({ message: err });
    }
  }

  async updateOrder(req: Request, res: Response) {
    try {
      const { transaction_status, order_id } = req.body;

      let status: "Pending" | "Paid" | "Cancel" =
        transaction_status === "settlement"
          ? "Paid"
          : transaction_status === "pending"
          ? "Pending"
          : "Cancel";

      if (status === "Cancel") {
        const details = await prisma.order_Details.findMany({
          where: { orderId: order_id },
        });

        for (const detail of details) {
          await prisma.ticket.update({
            where: { id: detail.ticketId },
            data: { seats: { increment: detail.qty } },
          });
        }
      }

      await prisma.order.update({
        where: { id: order_id },
        data: { status },
      });

      res.status(200).send({ message: "Order status updated successfully" });
    } catch (err) {
      console.error(err);
      res.status(400).send({ message: err });
    }
  }
}
