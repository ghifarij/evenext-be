import { Request, Response } from "express";
import prisma from "../prisma";
import { EventCategory } from "@prisma/client";

export class EventController {
  async getEvents(req: Request, res: Response) {
    try {
      const events = await prisma.event.findMany({
        select: {
          id: true,
          title: true,
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
      const { page = 1, limit = 9, category } = req.query;

      const whereCondition = category
        ? {
            category: {
              equals: category as EventCategory,
              mode: "insensitive",
            },
          }
        : {};

      const countEvents = await prisma.event.aggregate({
        _count: { _all: true },
        where: whereCondition,
      });

      const totalPage = Math.ceil(countEvents._count._all / +limit);

      const events = await prisma.event.findMany({
        where: whereCondition,
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
}
