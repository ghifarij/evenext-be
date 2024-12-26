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
<<<<<<< HEAD
        this.router.get("/profile", this.userController.getUsersId);
        this.router.post("/", this.userController.createUser);
        this.router.patch("/avatar", this.userController.editAvatar);
=======
        this.router.post("/", this.userController.createUser);
        this.router.patch("/avatar", this.userController.editAvatar);
        this.router.get("/:id", this.userController.getUsersId);
>>>>>>> 47bbff906e5d2ce1f0b59f2192de21f694879d69
        this.router.patch("/:id", this.userController.editUser);
        this.router.delete("/:id", this.userController.deleteUser);
    }
    getRouter() {
        return this.router;
    }
}
exports.UserRouter = UserRouter;
