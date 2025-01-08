import { Request, Response } from "express";
import prisma from "../prisma";
const midtransClient = require("midtrans-client");
import dotenv from "dotenv";
import { requestBody } from "../types/reqBody";
dotenv.config();

export class OrderController {
  async createOrder(req: Request<{}, {}, requestBody>, res: Response) {
    try {
      const userId = req.user?.id;
      const { total_price, coupon, point, final_price, orderCart } = req.body;
      const expiredAt = new Date(new Date().getTime() + 30 * 60 * 1000);

      if (!orderCart || !Array.isArray(orderCart)) {
        throw new Error(
          "Invalid orderCart data. Ensure it's an array of items."
        );
      }

      const orderId = await prisma.$transaction(async (prisma) => {
        if (coupon) {
          const coupon = await prisma.coupon.findFirst({
            where: { userId: userId },
          });
          await prisma.coupon.update({
            where: { id: coupon?.id },
            data: { isActive: false },
          });
        }
        if (point) {
          await prisma.point.updateMany({
            where: { userId: userId },
            data: { isActive: false },
          });
        }
        const { id } = await prisma.order.create({
          data: {
            userId: userId!,
            total_price,
            final_price,
            status: "Pending",
            coupon,
            point,
            expiredAt,
          },
        });

        await Promise.all(
          orderCart.map(async (item) => {
            if (item.qty > item.ticket.seats) {
              throw new Error(
                `Insufficient seats for ticket ID: ${item.ticket.id}`
              );
            }
            await prisma.order_Details.create({
              data: {
                orderId: id,
                ticketId: item.ticket.id,
                qty: item.qty,
                subtotal: item.qty * item.ticket.price,
              },
            });
            await prisma.ticket.update({
              where: { id: item.ticket.id },
              data: { seats: { decrement: item.qty } },
            });
          })
        );
        return id;
      });

      res
        .status(201)
        .send({ message: "Order created successfully", order_id: orderId });
    } catch (error) {
      console.error(error);
      res.status(400).send({ error: "Failed to create order", details: error });
    }
  }

  async getOrderId(req: Request, res: Response) {
    try {
      const order = await prisma.order.findUnique({
        where: { id: +req.params.id },
        select: {
          expiredAt: true,
          coupon: true,
          point: true,
          total_price: true,
          final_price: true,
          Order_Details: {
            select: {
              qty: true,
              subtotal: true,
              ticket: {
                select: {
                  category: true,
                  price: true,
                  event: {
                    select: {
                      title: true,
                      thumbnail: true,
                      date: true,
                      time: true,
                      location: true,
                      venue: true,
                    },
                  },
                },
              },
            },
          },
        },
      });
      res.status(200).send({ result: order });
    } catch (err) {
      console.log(err);
      res.status(400).send(err);
    }
  }

  async getSnapToken(req: Request, res: Response) {
    try {
      const { order_id } = req.body;
      const item_details = [];

      const checkTransaction = await prisma.order.findUnique({
        where: { id: order_id },
        select: { status: true, expiredAt: true, coupon: true, point: true },
      });
      if (checkTransaction?.status === "Cancel")
        throw "Status transaksi sudah menjadi cancel";

      const ticketTransaction = await prisma.order_Details.findMany({
        where: { orderId: order_id },
        include: {
          ticket: {
            select: {
              category: true,
            },
          },
        },
      });

      const user = await prisma.user.findUnique({
        where: { id: req.user?.id },
      });

      for (const item of ticketTransaction) {
        item_details.push({
          id: item.ticketId,
          price: item.subtotal / item.qty,
          quantity: item.qty,
          name: item.ticket.category,
        });
      }

      if (checkTransaction?.coupon) {
        const coupon = await prisma.coupon.findFirst({
          where: { userId: user?.id },
        });
        item_details.push({
          id: coupon?.id,
          price: -(req.body.total_price - checkTransaction.point) / 10,
          quantity: 1,
          name: "Coupon",
        });
      }

      if (checkTransaction && checkTransaction?.point > 0) {
        const points = await prisma.point.findMany({
          where: { userId: req.user?.id },
          select: { point: true },
          orderBy: { createdAt: "asc" },
        });

        item_details.push({
          id: points[0].point,
          price: -checkTransaction.point,
          quantity: 1,
          name: "Points",
        });
      }

      const resMinutes =
        new Date(`${checkTransaction?.expiredAt}`).getTime() -
        new Date().getTime();

      const snap = new midtransClient.Snap({
        isProduction: false,
        serverKey: `${process.env.MID_SERVER_KEY}`,
      });

      const parameters = {
        transaction_details: req.body,
        customer_details: {
          user_name: user?.username,
          email: user?.email,
        },
        item_details,
        page_expiry: {
          duration: new Date(resMinutes).getMinutes(),
          unit: "minutes",
        },
        expiry: {
          unit: "minutes",
          duration: new Date(resMinutes).getMinutes(),
        },
      };

      const transaction = await snap.createTransaction(parameters);
      res.status(200).send({ result: transaction.token });
    } catch (err) {
      console.log(err);
      res.status(400).send(err);
    }
  }

  async midtransWebHook(req: Request, res: Response) {
    try {
      const { transaction_status, order_id } = req.body;

      let statusTransaction: "Paid" | "Pending" | "Cancel" = "Pending";
      if (transaction_status === "settlement") {
        statusTransaction = "Paid";
      } else if (transaction_status === "cancel") {
        statusTransaction = "Cancel";
      }

      if (statusTransaction === "Cancel") {
        const tickets = await prisma.order_Details.findMany({
          where: { orderId: +order_id },
          select: {
            qty: true,
            ticketId: true,
          },
        });

        for (const item of tickets) {
          await prisma.ticket.update({
            where: { id: item.ticketId },
            data: { seats: { increment: item.qty } },
          });
        }
      }

      await prisma.order.update({
        where: { id: +order_id },
        data: {
          status: statusTransaction,
        },
      });
      res.status(200).send({ message: "Order berhasil" });
    } catch (err) {
      console.log(err);
      res.status(400).send(err);
    }
  }
}
