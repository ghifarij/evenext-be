"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserRouter = void 0;
const express_1 = require("express");
// import { checkUser, verifyToken} from "../middlewares/verify"
const user_controller_1 = require("../controller/user.controller");
const uploader_1 = require("../services/uploader");
const verify_1 = require("../middlewares/verify");
class UserRouter {
    constructor() {
        this.userController = new user_controller_1.UserController();
        this.router = (0, express_1.Router)();
        this.initializeRoutes();
    }
    initializeRoutes() {
        this.router.get("/", verify_1.verifyToken, verify_1.checkUser, this.userController.getUsers);
        this.router.post("/", verify_1.verifyToken, this.userController.createUser);
        this.router.patch("/avatar-cloud", verify_1.verifyToken, (0, uploader_1.uploader)("memoryStorage", "avatar").single("file"), this.userController.editAvatarCloud);
        this.router.get("/coupon", verify_1.verifyToken, this.userController.getUserCoupon);
        this.router.get("/points", verify_1.verifyToken, this.userController.getPointsUser);
        this.router.get("/:id", this.userController.getUsersId);
        this.router.patch("/:id", this.userController.editUser);
        this.router.delete("/:id", this.userController.deleteUser);
    }
    getRouter() {
        return this.router;
    }
}
exports.UserRouter = UserRouter;
