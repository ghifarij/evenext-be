"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserRouter = void 0;
const express_1 = require("express");
// import { checkUser, verifyToken} from "../middlewares/verify"
const user_controller_1 = require("../controller/user.controller");
class UserRouter {
    constructor() {
        this.userController = new user_controller_1.UserController();
        this.router = (0, express_1.Router)();
        this.initializeRoutes();
    }
    initializeRoutes() {
        this.router.get("/", this.userController.getUsers);
        this.router.post("/", this.userController.createUser);
        this.router.patch("/avatar", this.userController.editAvatar);
        this.router.get("/:id", this.userController.getUsersId);
        this.router.patch("/:id", this.userController.editUser);
        this.router.delete("/:id", this.userController.deleteUser);
    }
    getRouter() {
        return this.router;
    }
}
exports.UserRouter = UserRouter;
