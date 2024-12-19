import { Prisma } from "../../prisma/generated/client";
import { NextFunction, Request, Response } from "express";
import prisma from "../prisma";
import { validate as isUuid } from "uuid";

export class UserController {
  async getUsers(req: Request, res: Response) {
    console.log(req.user);

    try {
      const { search, page = 1, limit = 5 } = req.query;
      const filter: Prisma.UserWhereInput = {};

      if (search) {
        filter.OR = [
          { username: { contains: search as string, mode: "insensitive" } },
          { email: { contains: search as string, mode: "insensitive" } },
        ];
      }

      const countUser = await prisma.user.count({ where: filter });
      const total_page = Math.ceil(countUser / +limit);
      const users = await prisma.user.findMany({
        where: filter,
        orderBy: { id: "asc" },
        take: +limit,
        skip: +limit * (+page - 1),
      });

      res.status(200).send({ total_page, page, users });
    } catch (err) {
      console.log(err);
      res.status(400).send(err);
    }
  }

  async getUsersId(
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

      const user = await prisma.user.findUnique({
        where: { id },
      });

      if (!user) {
        res.status(404).json({ message: "User Not Found" });
        return;
      }

      res.status(200).send({ user });
    } catch (err) {
      console.log(err);
      res.status(400).send(err);
    }
  }

  async createUser(req: Request, res: Response) {
    try {
      const { username, email, password } = req.body;

      if (!username || !email || !password) {
        res.status(400).json({ message: "Missing required fields" });
        return;
      }

      const ref_code = "DEFAULT_CODE";
      const newUser = await prisma.user.create({
        data: { username, email, password, ref_code },
      });

      res.status(201).send({ message: "User Created! ✅", user: newUser });
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

  async editUser(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const updatedUser = await prisma.user.update({
        data: req.body,
        where: { id },
      });
      res.status(200).send({ message: "User Updated! ✅", user: updatedUser });
    } catch (err) {
      console.log(err);
      res.status(400).send(err);
    }
  }

  async deleteUser(req: Request, res: Response) {
    try {
      const { id } = req.params;
      await prisma.user.delete({ where: { id } });
      res.status(200).send("User Deleted! ✅");
    } catch (err) {
      console.log(err);
      res.status(400).send(err);
    }
  }

  async editAvatar(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const { avatarUrl } = req.body;

      if (!avatarUrl) {
        res.status(400).json({ message: "Avatar URL is required" });
        return;
      }

      const updatedUser = await prisma.user.update({
        where: { id },
        data: { avatar: avatarUrl },
      });

      res
        .status(200)
        .send({ message: "Avatar Updated! ✅", user: updatedUser });
    } catch (err) {
      console.log(err);
      res.status(400).send(err);
    }
  }
}
