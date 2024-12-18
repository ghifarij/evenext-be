import { RoleUser } from "../prisma/generated/client";
import "express";

export type UserPayload = {
  id: string;
};
export type PromotorPayload = {
  id: string;
};

declare global {
  namespace Express {
    export interface Request {
      user?: UserPayload;
      promotor?: PromotorPayload;
    }
  }
}
