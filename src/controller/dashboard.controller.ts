import { Request, Response } from "express";
import prisma from "../prisma";
import { Prisma } from "../../prisma/generated/client";

export class DashboardController {
  async getEventActive(req: Request, res: Response) {
    try {
      const promotorId = req.promotor?.id;
      if (!promotorId) {
        res.status(400).send({ message: "Invalid Promotor ID" });
      }

      const activeEvent = await prisma.event.count({
        where: {
          promotorId: promotorId,
          status: "active",
        },
      });
      res
        .status(200)
        .send({ message: "Get Event Actice Succesfull ✅", activeEvent });
    } catch (err) {
      console.log(err);
      res.status(400).send(err);
    }
  }
  async getEventFinish(req: Request, res: Response) {
    try {
      const promotorId = req.promotor?.id;
      if (!promotorId) {
        res.status(400).send({ message: "Invalid Promotor ID" });
      }

      const finishEvent = await prisma.event.count({
        where: {
          promotorId: promotorId,
          status: "finish",
        },
      });
      res
        .status(200)
        .send({ message: "Get Event Finish Succesfull ✅", finishEvent });
    } catch (err) {
      console.log(err);
      res.status(400).send(err);
    }
  }
  async getTotalTransaction(req: Request, res: Response) {
    try {
      const promotorId = req.promotor?.id;

      if (!promotorId) {
        res.status(400).send({ error: "Invalid promotor ID" });
      }

      // Total transaksi dari transaksi pengguna lain yang membeli tiket event userId
      const eventTransactions = await prisma.order.aggregate({
        _sum: {
          final_price: true,
        },
        where: {
          status: "Paid",
          Order_Details: {
            some: {
              ticket: {
                event: {
                  promotor: {
                    id: promotorId,
                  },
                },
              },
            },
          },
        },
      });

      // Hitung total transaksi dari kedua sumber
      const totalTransaction = eventTransactions._sum?.final_price || 0;

      res.status(200).send({
        message: "Get Total Transaction Succesfull ✅",
        totalTransaction,
      });
    } catch (error) {
      console.error("Error fetching total transaction: ", error);
      res.status(500).send({ message: "Internal Server Error" });
    }
  }

  async getIncomePerDay(req: Request, res: Response) {
    try {
      const promotorId = req.promotor?.id;

      if (!promotorId) {
        res
          .status(401)
          .send({ message: "Unauthorized: promotor not logged in" });
      }

      const transactions = await prisma.order.findMany({
        where: {
          status: "Paid",
          OR: [
            {
              Order_Details: {
                some: {
                  ticket: {
                    event: {
                      promotor: {
                        id: promotorId, // Pendapatan dari event milik user
                      },
                    },
                  },
                },
              },
            },
          ],
        },
        select: {
          createdAt: true,
          final_price: true,
        },
        orderBy: {
          createdAt: "asc",
        },
      });

      const incomePerDay = transactions.reduce((acc, transaction) => {
        const date = transaction.createdAt.toISOString().split("T")[0]; // Ambil bagian tanggal
        if (!acc[date]) {
          acc[date] = 0;
        }
        acc[date] += transaction.final_price || 0; // Tambahkan finalPrice
        return acc;
      }, {} as Record<string, number>);

      const formattedData = Object.entries(incomePerDay).map(
        ([date, totalIncome]) => ({
          date,
          totalIncome,
        })
      );

      res.status(200).send({ incomePerDay: formattedData });
    } catch (error) {
      console.error("Error fetching income per day: ", error);
      res.status(500).send({ message: "Internal Server Error" });
    }
  }

  async getIncomePerMonth(req: Request, res: Response) {
    try {
      const promotorId = req.promotor?.id;

      if (!promotorId) {
        res
          .status(401)
          .send({ message: "Unauthorized: promotor not logged in" });
      }

      const transactions = await prisma.order.findMany({
        where: {
          status: "Paid",
          OR: [
            {
              Order_Details: {
                some: {
                  ticket: {
                    event: {
                      promotor: {
                        id: promotorId,
                      },
                    },
                  },
                },
              },
            },
          ],
        },
        select: {
          createdAt: true,
          final_price: true,
        },
        orderBy: {
          createdAt: "asc",
        },
      });

      const incomePerMonth = transactions.reduce((acc, transaction) => {
        const month = transaction.createdAt.toISOString().slice(0, 7); // Format YYYY-MM
        if (!acc[month]) {
          acc[month] = 0;
        }
        acc[month] += transaction.final_price || 0;
        return acc;
      }, {} as Record<string, number>);

      const formattedIncome = Object.entries(incomePerMonth).map(
        ([month, totalIncome]) => ({
          month,
          totalIncome,
        })
      );

      res.status(200).send({ incomePerMonth: formattedIncome });
    } catch (error) {
      console.error("Error fetching income per month: ", error);
      res.status(500).send({ message: "Internal Server Error" });
    }
  }

  async getIncomePerYear(req: Request, res: Response) {
    try {
      const promotorId = req.promotor?.id;

      if (!promotorId) {
        res
          .status(401)
          .send({ message: "Unauthorized: promotor not logged in" });
      }

      const transactions = await prisma.order.findMany({
        where: {
          status: "Paid",
          OR: [
            {
              Order_Details: {
                some: {
                  ticket: {
                    event: {
                      promotor: {
                        id: promotorId,
                      },
                    },
                  },
                },
              },
            },
          ],
        },
        select: {
          createdAt: true,
          final_price: true,
        },
        orderBy: {
          createdAt: "asc",
        },
      });

      const incomePerYear = transactions.reduce((acc, transaction) => {
        const year = transaction.createdAt.toISOString().slice(0, 4); // Format YYYY
        if (!acc[year]) {
          acc[year] = 0;
        }
        acc[year] += transaction.final_price || 0;
        return acc;
      }, {} as Record<string, number>);

      const formattedIncome = Object.entries(incomePerYear).map(
        ([year, totalIncome]) => ({
          year,
          totalIncome,
        })
      );

      res.status(200).send({ incomePerYear: formattedIncome });
    } catch (error) {
      console.error("Error fetching income per year: ", error);
      res.status(500).send({ message: "Internal Server Error" });
    }
  }
  async getTicketSales(req: Request, res: Response) {
    try {
      // Grouping data berdasarkan `orderId` untuk menghasilkan struktur mirip `IOrder`
      const orders = await prisma.order.findMany({
        include: {
          Order_Details: {
            include: {
              ticket: {
                include: {
                  event: true, // Mengambil detail event
                },
              },
            },
          },
        },
      });
  
      // Mapping hasil untuk sesuai dengan struktur `IOrder`
      const formattedOrders = orders.map((order) => ({
        expiredAt: order.expiredAt,
        coupon: order.coupon,
        point: order.point,
        total_price: order.total_price,
        final_price: order.final_price,
        Order_Details: order.Order_Details.map((detail) => ({
          qty: detail.qty,
          subtotal: detail.subtotal,
          ticket: {
            category: detail.ticket.category as
              | "Free"
              | "EarlyBird"
              | "Regular"
              | "VIP",
            price: detail.ticket.price,
            event: {
              title: detail.ticket.event.title,
              thumbnail: detail.ticket.event.thumbnail,
              date: detail.ticket.event.date,
              time: detail.ticket.event.time,
              location: detail.ticket.event.location as
                | "Bandung"
                | "Jakarta"
                | "Surabaya"
                | "Bali",
              venue: detail.ticket.event.venue,
            },
          },
        })),
      }));
  
      res.status(200).json({ success: true, data: formattedOrders });
    } catch (error) {
      console.error("Error fetching ticket sales:", error);
      res.status(500).json({ success: false, message: "Internal Server Error" });
    }
  }
  
}
