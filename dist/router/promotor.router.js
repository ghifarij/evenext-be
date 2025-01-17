"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PromotorRouter = void 0;
const express_1 = require("express");
// import { checkpromotor, verifyToken} from "../middlewares/verify"
const promotor_controller_1 = require("../controller/promotor.controller");
const uploader_1 = require("../services/uploader");
const verify_1 = require("../middlewares/verify");
class PromotorRouter {
    constructor() {
        this.promotorController = new promotor_controller_1.PromotorController();
        this.router = (0, express_1.Router)();
        this.initializeRoutes();
    }
    initializeRoutes() {
        this.router.get("/", verify_1.verifyTokenPro, verify_1.checkPromotor, this.promotorController.getPromotors);
        this.router.post("/", verify_1.verifyTokenPro, this.promotorController.createPromotor);
        this.router.patch("/avatar-cloud", verify_1.verifyTokenPro, (0, uploader_1.uploader)("memoryStorage", "avatar").single("file"), this.promotorController.editAvatarProCloud);
        this.router.get("/:id", this.promotorController.getPromotorsId);
        this.router.patch("/:id", this.promotorController.editPromotor);
        this.router.delete("/:id", this.promotorController.deletePromotor);
    }
    getRouter() {
        return this.router;
    }
}
exports.PromotorRouter = PromotorRouter;
