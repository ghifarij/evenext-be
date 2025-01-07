import { Request, Response } from "express";
import prisma from "../prisma";

export class ReviewController {
  async createReview(req: Request, res: Response) {
    try {
      const user = await prisma.review.findFirst({
        where: { userId: req.user?.id },
      });
      if (user) throw { message: "Review hanya boleh sekali" };

      await prisma.review.create({
        data: { ...req.body, userId: req.user?.id, eventId: +req.params.id },
      });
      res.status(200).send({ message: "Review Created" });
    } catch (err) {
      console.log(err);
      res.status(400).send(err);
    }
  }

  async getReviews(req: Request, res: Response) {
    try {
      const reviews = await prisma.review.findMany({
        where: { eventId: +req.params.id },
        select: {
          rating: true,
          description: true,
          createdAt: true,
          user: {
            select: {
              avatar: true,
              username: true,
            },
          },
        },
      });
      res.status(200).send({ result: reviews });
    } catch (err) {
      console.log(err);
      res.status(400).send(err);
    }
  }

  async getAvg(req: Request, res: Response) {
    try {
      const avgRating = await prisma.review.aggregate({
        where: { event: { promotorId: req.params.id } },
        _avg: { rating: true },
      });
      res.status(200).send({ result: avgRating._avg.rating });
    } catch (err) {
      console.log(err);
      res.status(400).send(err);
    }
  }
}
