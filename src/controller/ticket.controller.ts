import { Request, Response } from "express";
import prisma from "../prisma";

interface TicketInput {
  category: "Free" | "EarlyBird" | "Regular" | "VIP";
  seats: number;
  price: number;
}

export class TicketController {
  async createTicket(req: Request, res: Response) {
    try {
      const tickets: TicketInput[] = req.body;
      const { eventId } = req.params;

      if (!eventId) {
        return res.status(400).json({ error: "eventId is required" });
      }

      const event = await prisma.event.findUnique({
        where: { id: Number(eventId) },
      });

      if (!event) {
        return res.status(404).json({ error: "Event not found" });
      }

      const createdTickets = await Promise.all(
        tickets.map((ticket) =>
          prisma.ticket.create({
            data: {
              category: ticket.category,
              seats: ticket.seats,
              price: ticket.price,
              event: {
                connect: {
                  id: Number(eventId),
                },
              },
            },
          })
        )
      );

      res.status(201).send({ createdTickets });
    } catch (err) {
      console.error(err);
      res.status(500).send(err);
    }
  }

  async getTickets(req: Request, res: Response) {
    try {
      const tickets = await prisma.ticket.findMany({
        select: {
          id: true,
          category: true,
          seats: true,
          price: true,
          eventId: true,
        },
      });
      res.status(200).send({ tickets });
    } catch (err) {
      console.log(err);
      res.status(400).send(err);
    }
  }
}
