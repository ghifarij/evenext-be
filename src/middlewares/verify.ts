import { NextFunction, Request, Response } from "express";
import { verify } from "jsonwebtoken";
import { PromotorPayload, UserPayload } from "../custom";

export const verifyToken = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    // const token = req.header("Authorization")?.replace("Bearer ", "");
    const token = req.cookies?.token; // kalo sudah pakai cookies
    if (!token) throw "Unauthorize!";

    const verifiedUser = verify(token, process.env.JWT_KEY!);
    req.user = verifiedUser as UserPayload;
    console.log(verifiedUser);
    

    next();
  } catch (err) {
    console.log(err);
    res.status(400).send(err);
  }
};

export const checkUser = (req: Request, res: Response, next: NextFunction) => {
  if (req.user?.id) {
    next();
  } else {
    res.status(400).send({ message: "Unauthorize, User Only!" });
  }
};

export const verifyTokenPro = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    // const token = req.header("Authorization")?.replace("Bearer ", "");
    const token = req.cookies?.token; // kalo sudah pakai cookies
    if (!token) throw "Unauthorize!";

    const verifiedPromotor = verify(token, process.env.JWT_KEY!);
    req.promotor = verifiedPromotor as PromotorPayload;
    console.log(verifiedPromotor);
    

    next();
  } catch (err) {
    console.log(err);
    res.status(400).send(err);
  }
};

export const checkPromotor = (req: Request, res: Response, next: NextFunction) => {
  if (req.promotor?.id) {
    next();
  } else {
    res.status(400).send({ message: "Unauthorize, Promotor Only!" });
  }
};