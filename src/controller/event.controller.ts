import { Request, Response } from "express";
import prisma from "../prisma";
import { cloudinaryUpload } from "../services/cloudinary";
import { Prisma } from "../../prisma/generated/client";

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
      const { search, page = 1, limit = 9 } = req.query;

      const filter: Prisma.EventWhereInput = {};
      if (search) {
        filter.title = { contains: search as string, mode: "insensitive" };
      }

      const countEvents = await prisma.event.aggregate({
        _count: { _all: true },
      });
      const totalPage = Math.ceil(countEvents._count._all / +limit);

      const events = await prisma.event.findMany({
        where: filter,
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

  async createEvent(req: Request, res: Response) {
    try {
      if (!req.file) throw { message: "thumbnail empty" };
      const { secure_url } = await cloudinaryUpload(req.file, "event");
      const {
        title,
        slug,
        date,
        time,
        location,
        venue,
        category,
        description,
        terms,
      } = req.body;

      const promotorId = req.promotor?.id!;

      const event = await prisma.event.create({
        data: {
          thumbnail: secure_url,
          title,
          slug,
          date,
          time,
          location,
          venue,
          category,
          description,
          terms,
          promotorId,
        },
      });

      res.status(200).send({ message: "Event created", id: event.id });
    } catch (err) {
      console.log(err);
      res.status(400).send(err);
    }
  }
}
