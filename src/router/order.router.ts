import { Router } from "express";
import { OrderController } from "../controller/order.controller";
import { verifyToken } from "../middlewares/verify";

export class OrderRouter {
  private router: Router;
  private orderController: OrderController;

  constructor() {
    this.router = Router();
    this.orderController = new OrderController();
    this.initializeRoutes();
  }

  private initializeRoutes() {
    this.router.post("/", verifyToken, this.orderController.createOrder);
    this.router.post(
      "/payment",
      verifyToken,
      this.orderController.getSnapToken
    );
    this.router.post("/midtrans-webhook", this.orderController.midtransWebHook);
    this.router.get("/:id", this.orderController.getOrderId);
  }

  getRouter(): Router {
    return this.router;
  }
}
