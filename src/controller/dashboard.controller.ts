import { Request, Response } from "express";
import prisma from "../prisma";
import { Prisma } from "../../prisma/generated/client";

export class DasboardController {
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
}
