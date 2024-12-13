import { Request, Response } from "express";
import prisma from "../prisma";

export class TicketController {
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
