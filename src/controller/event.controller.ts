import { Request, Response } from "express";
import prisma from "../prisma";

export class EventController {
  async getEvents(req: Request, res: Response) {
    try {
      const events = await prisma.event.findMany({
        select: {
          id: true,
          title: true,
          slug: true,
          thumbnail: true,
          date: true,
          location: true,
          venue: true,
        },
      });
      res.status(200).send({ events });
    } catch (err) {
      console.log(err);
      res.status(400).send(err);
    }
  }

  async getAllEvents(req: Request, res: Response) {
    try {
      const { page = 1, limit = 9 } = req.query;

      const countEvents = await prisma.event.aggregate({
        _count: { _all: true },
      });
      const totalPage = Math.ceil(countEvents._count._all / +limit);

      const events = await prisma.event.findMany({
        orderBy: { id: "asc" },
        take: +limit,
        skip: +limit * (+page - 1),
      });
      res.status(200).send({ totalPage, page: +page, events });
    } catch (err) {
      console.log(err);
      res.status(400).send(err);
    }
  }

  async getEventSlug(req: Request, res: Response) {
    try {
      const { slug } = req.params;
      const event = await prisma.event.findUnique({
        where: { slug: slug },
        select: {
          id: true,
          title: true,
          slug: true,
          thumbnail: true,
          description: true,
          terms: true,
          category: true,
          location: true,
          venue: true,
          date: true,
          time: true,
          promotor: {
            select: {
              username: true,
              email: true,
              password: true,
              avatar: true,
            },
          },
          Ticket: {
            select: {
              category: true,
              seats: true,
              price: true,
            },
          },
        },
      });
      res.status(200).send({ event });
    } catch (err) {
      console.log(err);
      res.status(400).send(err);
    }
  }
}
