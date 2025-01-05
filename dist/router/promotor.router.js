"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PromotorRouter = void 0;
const express_1 = require("express");
// import { checkpromotor, verifyToken} from "../middlewares/verify"
const promotor_controller_1 = require("../controller/promotor.controller");
class PromotorRouter {
    constructor() {
        this.promotorController = new promotor_controller_1.PromotorController();
        this.router = (0, express_1.Router)();
        this.initializeRoutes();
    }
    initializeRoutes() {
        this.router.get("/", this.promotorController.getPromotors);
        this.router.post("/", this.promotorController.createPromotor);
        this.router.patch("/avatar", this.promotorController.editAvatarPro);
        this.router.get("/:id", this.promotorController.getPromotorsId);
        this.router.patch("/:id", this.promotorController.editPromotor);
        this.router.delete("/:id", this.promotorController.deletePromotor);
    }
    getRouter() {
        return this.router;
    }
}
exports.PromotorRouter = PromotorRouter;
