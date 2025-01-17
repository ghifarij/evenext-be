import { Request, Response } from "express";
import prisma from "../prisma";
import { genSalt, hash, compare } from "bcrypt";
import { sign, verify } from "jsonwebtoken";
import { findUser } from "../services/user.service";
import { findPromotor } from "../services/promotor.service";
import { transporter } from "../services/mailer";
import path from "path";
import fs from "fs";
import Handlebars from "handlebars";
import { generateRefCode } from "../utilities/generateCode";
import { addMonths } from "date-fns";

export class AuthController {
  async registerUser(req: Request, res: Response) {
    try {
      const { password, confirmPassword, username, email, referred_by } =
        req.body;
      if (password != confirmPassword) throw { message: "Password not match!" };

      const user = await findUser(username, email);
      if (user) throw { message: "Username or email has been used !" };

      const salt = await genSalt(10);
      const hashPassword = await hash(password, salt);

      if (!referred_by) {
        const newUser: any = await prisma.user.create({
          data: {
            username,
            email,
            password: hashPassword,
            ref_code: generateRefCode(),
            referred_by,
          },
        });

        const payload = { id: newUser.id };
        const token = sign(payload, process.env.JWT_KEY!, { expiresIn: "60m" });
        const linkUser = `${process.env.BASE_URL_FE}/verify/${token}`;

        const templatePath = path.join(
          __dirname,
          "../templates",
          "verifyUser.hbs"
        );
        const tempateSource = fs.readFileSync(templatePath, "utf-8");
        const compiledTemplate = Handlebars.compile(tempateSource);
        const html = compiledTemplate({
          username,
          linkUser,
          ref_code: newUser.ref_code,
        });

        await transporter.sendMail({
          from: "evenext.corp@gmail.com",
          to: email,
          subject: "Welcome to Evenext !",
          html,
        });

        res.status(201).send({ message: "Reqister Successfully ✅" });
        return;
      } else {
        const referrer = await prisma.user.findUnique({
          where: { ref_code: `${referred_by}` },
        });
        if (!referrer) throw { message: "Invalid Referral Code !" };
        const newUser: any = await prisma.user.create({
          data: {
            username,
            email,
            password: hashPassword,
            ref_code: generateRefCode(),
            referred_by,
          },
        });
        await prisma.coupon.create({
          data: {
            isActive: true,
            expiredAt: addMonths(new Date(), 3),
            userId: newUser.id,
          },
        });
        await prisma.point.create({
          data: {
            point: 10000,
            expiredAt: addMonths(new Date(), 3),
            isActive: true,
            userId: referrer.id,
          },
        });
        const payload = { id: newUser.id };
        const token = sign(payload, process.env.JWT_KEY!, { expiresIn: "60m" });
        const linkUser = `${process.env.BASE_URL_FE}/verify/${token}`;

        const templatePath = path.join(
          __dirname,
          "../templates",
          "verifyUser.hbs"
        );
        const tempateSource = fs.readFileSync(templatePath, "utf-8");
        const compiledTemplate = Handlebars.compile(tempateSource);
        const html = compiledTemplate({
          username,
          linkUser,
          ref_code: newUser.ref_code,
        });

        await transporter.sendMail({
          from: "evenext.corp@gmail.com",
          to: email,
          subject: "Welcome to Evenext !",
          html,
        });

        res.status(201).send({ message: "Reqister Successfully ✅" });
        return;
      }
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

      const payload = { id: user.id, type: "user" };
      const token = sign(payload, process.env.JWT_KEY!, { expiresIn: "1d" });

      res.status(200).send({
        message: "Login Successfully ✅",
        token,
      });
    } catch (err) {
      console.log(err);
      res.status(400).send(err);
    }
  }

  async verifyUser(req: Request, res: Response) {
    try {
      const { token } = req.params;
      console.log(token);

      const verifiedUser: any = verify(token, process.env.JWT_KEY!);
      console.log(verifiedUser);

      await prisma.user.update({
        data: { isVerify: true },
        where: { id: `${verifiedUser.id}` },
      });
      res.status(200).send({ message: "Verify Successfully ✅" });
    } catch (err) {
      console.log(err);
      res.status(400).send(err);
    }
  }

  async registerPromotor(req: Request, res: Response) {
    try {
      const { password, confirmPassword, username, email } = req.body;
      if (password != confirmPassword) throw { message: "Password not match!" };

      const promotor = await findPromotor(username, email);
      if (promotor) throw { message: "Username or email has been used !" };

      const salt = await genSalt(10);
      const hashPassword = await hash(password, salt);

      const newPromotor = await prisma.promotor.create({
        data: { username, email, password: hashPassword },
      });

      const payload = { id: newPromotor.id };
      console.log(payload);

      const token = sign(payload, process.env.JWT_KEY!, { expiresIn: "10m" });
      const linkPromotor = `${process.env.BASE_URL_FE}/verifyPro/${token}`;

      const templatePath = path.join(
        __dirname,
        "../templates",
        "verifyPromotor.hbs"
      );
      const tempateSource = fs.readFileSync(templatePath, "utf-8");
      const compiledTemplate = Handlebars.compile(tempateSource);
      const html = compiledTemplate({ username, linkPromotor });

      await transporter.sendMail({
        from: "evenext.corp@gmail.com",
        to: email,
        subject: "Welcome to Evenext Promotor !",
        html,
      });

      res.status(201).send({ message: "Reqister Successfully ✅" });
    } catch (err) {
      console.log(err);
      res.status(400).send(err);
    }
  }
  async loginPromotor(req: Request, res: Response) {
    try {
      const { data, password } = req.body;
      const promotor = await findPromotor(data, data);

      if (!promotor) throw { message: "Account Not Found !" };
      if (!promotor.isVerify) throw { message: "Account Not Verify !" };

      const isValidPass = await compare(password, promotor.password);
      if (!isValidPass) throw { message: "Incorrect Password !" };

      const payload = { id: promotor.id, type: "promotor" };
      const token = sign(payload, process.env.JWT_KEY!, { expiresIn: "1d" });

      res.status(200).send({
        message: "Login Successfully ✅",
        token,
      });
    } catch (err) {
      console.log(err);
      res.status(400).send(err);
    }
  }
  async verifyPromotor(req: Request, res: Response) {
    try {
      const { token } = req.params;
      const verifiedPromotor: any = verify(token, process.env.JWT_KEY!);
      await prisma.promotor.update({
        data: { isVerify: true },
        where: { id: verifiedPromotor.id },
      });
      res.status(200).send({ message: "Verify Successfully ✅" });
    } catch (err) {
      console.log(err);
      res.status(400).send(err);
    }
  }

  async getSession(req: Request, res: Response): Promise<void> {
    try {
      // Retrieve token from Authorization header
      const authHeader = req.headers.authorization;
      if (!authHeader || !authHeader.startsWith("Bearer ")) {
        res.status(401).send({ message: "Unauthorized: No token provided" });
        return;
      }

      const token = authHeader.split(" ")[1];
      if (!token) {
        res.status(401).send({ message: "Unauthorized: Token missing" });
        return;
      }

      // Verify token
      const decoded = verify(token, process.env.JWT_KEY!) as {
        id: string;
        type: string;
      };

      if (!decoded || !decoded.type) {
        res.status(403).send({ message: "Forbidden: Invalid token" });
        return;
      }

      // Handle different user types
      if (decoded.type === "promotor") {
        const promotor = await prisma.promotor.findUnique({
          where: { id: decoded.id },
        });

        if (!promotor) {
          res.status(404).send({ message: "Promotor not found" });
          return;
        }

        res.status(200).send({
          id: promotor.id,
          type: "promotor",
          username: promotor.username,
          email: promotor.email,
          avatar: promotor.avatar || null,
        });
      } else if (decoded.type === "user") {
        const user = await prisma.user.findUnique({
          where: { id: decoded.id },
          select: {
            id: true,
            username: true,
            email: true,
            avatar: true,
            createdAt: true,
            ref_code: true,
            updatedAt: true,
            isVerify: true,
            User_Point: {
              select: {
                point: true,
                expiredAt: true,
              },
            },
            User_Coupon: {
              select: {
                id: true,
                expiredAt: true,
              },
            },
          },
        });

        if (!user) {
          res.status(404).send({ message: "User not found" });
          return;
        }

        // Calculate total points
        const totalPoints = user.User_Point.reduce(
          (sum, point) => sum + point.point,
          0
        );

        res.status(200).json({
          id: user.id,
          type: "user",
          username: user.username,
          email: user.email,
          avatar: user.avatar,
          User_Point: user.User_Point,
          totalPoints, // Include the calculated total points
          ref_code: user.ref_code,
          User_Coupon: user.User_Coupon,
        });
      } else {
        res.status(403).json({ message: "Forbidden: Unknown token type" });
      }
    } catch (err) {
      console.error("Error fetching session:", err);
      res
        .status(401)
        .send({ message: "Unauthorized: Invalid or expired token" });
    }
  }

  async forgotPasswordUser(req: Request, res: Response) {
    try {
      const { email } = req.body;

      // Check if the email exists in the database
      const user = await prisma.user.findUnique({
        where: { email },
      });

      if (!user) {
        res.status(404).send({ message: "Email not found!" });
        return;
      }

      // Generate a password reset token
      const payload = { id: user.id, email: user.email };
      const resetToken = sign(payload, process.env.JWT_KEY!, {
        expiresIn: "1h", // Token valid for 1 hour
      });

      // Create the password reset link
      const resetLink = `${process.env.BASE_URL_FE}/user/resetPasswordUser/${resetToken}`;

      // Prepare the email template
      const templatePath = path.join(
        __dirname,
        "../templates",
        "forgotPassword.hbs"
      );
      const templateSource = fs.readFileSync(templatePath, "utf-8");
      const compiledTemplate = Handlebars.compile(templateSource);
      const html = compiledTemplate({ username: user.username, resetLink });

      // Send the email
      await transporter.sendMail({
        from: "evenext.corp@gmail.com",
        to: email,
        subject: "Password Reset Request",
        html,
      });

      res
        .status(200)
        .send({ message: "Password reset link sent to your email!" });
    } catch (err) {
      console.error(err);
      res
        .status(500)
        .send({ message: "An error occurred while sending the reset link." });
    }
  }

  async resetPasswordUser(req: Request, res: Response) {
    try {
      const { token, newPassword, confirmPassword } = req.body;

      console.log("Request body:", req.body);

      if (!token) {
        res.status(400).send({ message: "Token is required!" });
        return;
      }

      if (newPassword !== confirmPassword) {
        res.status(400).send({ message: "Passwords do not match!" });
        return;
      }

      // Verify the reset token
      let decoded: any;
      try {
        decoded = verify(token, process.env.JWT_KEY!);
      } catch (err) {
        console.error("Token verification failed:", err);
        res.status(400).send({ message: "Invalid or expired token!" });
        return;
      }

      console.log("Token decoded:", decoded);

      // Check if the user exists
      const user = await prisma.user.findUnique({
        where: { id: decoded.id },
      });

      if (!user) {
        res.status(404).send({ message: "User not found!" });
        return;
      }

      // Hash the new password
      const salt = await genSalt(10);
      const hashedPassword = await hash(newPassword, salt);

      // Update the user's password
      await prisma.user.update({
        where: { id: user.id },
        data: { password: hashedPassword },
      });

      res
        .status(200)
        .send({ message: "Password has been reset successfully!" });
    } catch (err) {
      console.error("Error resetting password:", err);
      res.status(500).send({ message: "An internal server error occurred!" });
    }
  }

  async forgotPasswordPromotor(req: Request, res: Response) {
    try {
      const { email } = req.body;

      // Check if the email exists in the database
      const promotor = await prisma.promotor.findUnique({
        where: { email },
      });

      if (!promotor) {
        res.status(404).send({ message: "Email not found!" });
        return;
      }

      // Generate a password reset token
      const payload = { id: promotor.id, email: promotor.email };
      const resetToken = sign(payload, process.env.JWT_KEY!, {
        expiresIn: "1h", // Token valid for 1 hour
      });

      // Create the password reset link
      const resetLink = `${process.env.BASE_URL_FE}/promotor/resetPasswordPromotor/${resetToken}`;

      // Prepare the email template
      const templatePath = path.join(
        __dirname,
        "../templates",
        "forgotPassword.hbs"
      );
      const templateSource = fs.readFileSync(templatePath, "utf-8");
      const compiledTemplate = Handlebars.compile(templateSource);
      const html = compiledTemplate({ username: promotor.username, resetLink });

      // Send the email
      await transporter.sendMail({
        from: "evenext.corp@gmail.com",
        to: email,
        subject: "Password Reset Request",
        html,
      });

      res
        .status(200)
        .send({ message: "Password reset link sent to your email!" });
    } catch (err) {
      console.error(err);
      res
        .status(500)
        .send({ message: "An error occurred while sending the reset link." });
    }
  }

  async resetPasswordPromotor(req: Request, res: Response) {
    try {
      const { token, newPassword, confirmPassword } = req.body;

      console.log("Request body:", req.body);

      if (!token) {
        res.status(400).send({ message: "Token is required!" });
        return;
      }

      if (newPassword !== confirmPassword) {
        res.status(400).send({ message: "Passwords do not match!" });
        return;
      }

      // Verify the reset token
      let decoded: any;
      try {
        decoded = verify(token, process.env.JWT_KEY!);
      } catch (err) {
        console.error("Token verification failed:", err);
        res.status(400).send({ message: "Invalid or expired token!" });
        return;
      }

      console.log("Token decoded:", decoded);

      // Check if the promotor exists
      const promotor = await prisma.promotor.findUnique({
        where: { id: decoded.id },
      });

      if (!promotor) {
        res.status(404).send({ message: "Promotor not found!" });
        return;
      }

      // Hash the new password
      const salt = await genSalt(10);
      const hashedPassword = await hash(newPassword, salt);

      // Update the promotor's password
      await prisma.promotor.update({
        where: { id: promotor.id },
        data: { password: hashedPassword },
      });

      res
        .status(200)
        .send({ message: "Password has been reset successfully!" });
    } catch (err) {
      console.error("Error resetting password:", err);
      res.status(500).send({ message: "An internal server error occurred!" });
    }
  }
}
