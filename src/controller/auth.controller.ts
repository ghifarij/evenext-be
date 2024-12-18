import { Request, Response } from "express";
import prisma from "../prisma";
import { genSalt, hash, compare } from "bcrypt";
import { sign, verify } from "jsonwebtoken";
import { findUser } from "../services/user.service";
import { transporter } from "../services/mailer";
import path from "path";
import fs from "fs";
import Handlebars from "handlebars";

export class AuthController {
  async registerUser(req: Request, res: Response) {
    try {
      const { password, confirmPassword, username, email } = req.body;
      if (password != confirmPassword) throw { message: "Password not match!" };

      const user = await findUser(username, email);
      if (user) throw { message: "Username or email has been used !" };

      const salt = await genSalt(10);
      const hashPassword = await hash(password, salt);

      const newUser = await prisma.user.create({
        data: { username, email, password: hashPassword },
      });

      const payload = { id: newUser.id };
      console.log(payload);

      const token = sign(payload, process.env.JWT_KEY!, { expiresIn: "10m" });
      const linkUser = `${process.env.BASE_URL_FE}/verify/${token}`;

      const templatePath = path.join(
        __dirname,
        "../templates",
        "verifyUser.hbs"
      );
      const tempateSource = fs.readFileSync(templatePath, "utf-8");
      const compiledTemplate = Handlebars.compile(tempateSource);
      const html = compiledTemplate({ username, linkUser });

      await transporter.sendMail({
        from: "evenext.corp@gmail.com",
        to: email,
        subject: "Welcome to Evenext !",
        html,
      });

      res.status(201).send({ message: "Reqister Successfully ✅" });
    } catch (err) {
      console.log(err);
      res.status(400).send(err);
    }
  }
  async loginUser(req: Request, res: Response) {
    try {
      const { data, password } = req.body;
      const user = await findUser(data, data);

      if (!user) throw { message: "Account Not Found !" };
      if (!user.isVerify) throw { message: "Account Not Verify !" };

      const isValidPass = await compare(password, user.password);
      if (!isValidPass) throw { message: "Incorrect Password !" };

      const payload = { id: user.id, role: user };
      const token = sign(payload, process.env.JWT_KEY!, { expiresIn: "1d" });

      res
        .status(200)
        .cookie("token", token, {
          httpOnly: true,
          secure: true,
          sameSite: "none",
          maxAge: 24 * 3600 * 1000,
          path: "/",
        })
        .send({
          message: "Login Successfully ✅",
          user,
        });
    } catch (err) {
      console.log(err);
      res.status(400).send(err);
    }
  }
  async verifyUser(req: Request, res: Response) {
    try {
      const { token } = req.params;
      const verifiedUser: any = verify(token, process.env.JWT_KEY!);
      await prisma.user.update({
        data: { isVerify: true },
        where: { id: verifiedUser.id },
      });
      res.status(200).send({ message: "Verify Successfully ✅" });
    } catch (err) {
      console.log(err);
      res.status(400).send(err);
    }
  }
}
