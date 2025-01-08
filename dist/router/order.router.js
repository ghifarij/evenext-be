"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.OrderRouter = void 0;
const express_1 = require("express");
const order_controller_1 = require("../controller/order.controller");
const verify_1 = require("../middlewares/verify");
class OrderRouter {
    constructor() {
        this.router = (0, express_1.Router)();
        this.orderController = new order_controller_1.OrderController();
        this.initializeRoutes();
    }
    initializeRoutes() {
        this.router.post("/", verify_1.verifyToken, this.orderController.createOrder);
        this.router.post("/payment", verify_1.verifyToken, this.orderController.getSnapToken);
        this.router.post("/midtrans-webhook", this.orderController.midtransWebHook);
        this.router.get("/:id", this.orderController.getOrderId);
    }
    getRouter() {
        return this.router;
    }
}
exports.OrderRouter = OrderRouter;
