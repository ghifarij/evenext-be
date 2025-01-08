import { NextFunction, Request, Response } from "express";
import prisma from "../prisma";
import { validate as isUuid } from "uuid";
import { cloudinaryUpload } from "../services/cloudinary";
import { Prisma } from "../../prisma/generated/client";

export class PromotorController {
  async getPromotors(req: Request, res: Response) {
    console.log(req.promotor);

    try {
      const { search, page = 1, limit = 5 } = req.query;
      const filter: Prisma.PromotorWhereInput = {};

      if (search) {
        filter.OR = [
          { username: { contains: search as string, mode: "insensitive" } },
          { email: { contains: search as string, mode: "insensitive" } },
        ];
      }

      const countPromotor = await prisma.promotor.count({ where: filter });
      const total_page = Math.ceil(countPromotor / +limit);
      const promotors = await prisma.promotor.findMany({
        where: filter,
        orderBy: { id: "asc" },
        take: +limit,
        skip: +limit * (+page - 1),
      });

      res.status(200).send({ total_page, page, promotors });
    } catch (err) {
      console.log(err);
      res.status(400).send(err);
    }
  }

  async getPromotorsId(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const { id } = req.params;

      if (!isUuid(id)) {
        res.status(400).json({ message: "Invalid UUID format" });
        return;
      }

      const promotor = await prisma.promotor.findUnique({
        where: { id },
      });

      if (!promotor) {
        res.status(404).json({ message: "Promotor Not Found" });
        return;
      }

      res.status(200).send({ promotor });
    } catch (err) {
      console.log(err);
      res.status(400).send(err);
    }
  }

  async createPromotor(req: Request, res: Response) {
    try {
      const { username, email, password } = req.body;

      if (!username || !email || !password) {
        res.status(400).json({ message: "Missing required fields" });
        return;
      }

      const newPromotor = await prisma.promotor.create({
        data: { username, email, password },
      });

      res
        .status(201)
        .send({ message: "Promotor Created! ✅", promotor: newPromotor });
    } catch (err: any) {
      if (
        err instanceof Prisma.PrismaClientKnownRequestError &&
        err.code === "P2002"
      ) {
        res.status(400).json({
          message: "Duplicate field value violates a unique constraint",
        });
        return;
      }
      console.log(err);
      res.status(400).send(err);
    }
  }

  async editPromotor(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const updatedPromotor = await prisma.promotor.update({
        data: req.body,
        where: { id: id || "" },
      });
      res
        .status(200)
        .send({ message: "Promotor Updated! ✅", promotor: updatedPromotor });
    } catch (err) {
      console.log(err);
      res.status(400).send(err);
    }
  }

  async deletePromotor(req: Request, res: Response) {
    try {
      const { id } = req.params;
      await prisma.promotor.delete({ where: { id } });
      res.status(200).send({ message: "Promotor Deleted! ✅" });
    } catch (err) {
      console.log(err);
      res.status(400).send(err);
    }
  }

  async editAvatarProCloud(req: Request, res: Response) {
    try {
      if (!req.file) throw { message: "File is Empty!" };
      const { secure_url } = await cloudinaryUpload(req.file, "avatar");

      await prisma.promotor.update({
        data: { avatar: secure_url },
        where: { id: req.promotor?.id },
      });
      res.status(200).send({ message: "Avatar Edited! ✅" });
    } catch (err) {
      console.log(err);
      res.status(400).send(err);
    }
  }
}
