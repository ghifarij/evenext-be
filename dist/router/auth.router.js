"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthRouter = void 0;
const express_1 = require("express");
const auth_controller_1 = require("../controller/auth.controller");
class AuthRouter {
    constructor() {
        this.authController = new auth_controller_1.AuthController();
        this.router = (0, express_1.Router)();
        this.initializeRoutes();
    }
    initializeRoutes() {
        this.router.get("/getSession", this.authController.getSession);
        this.router.post("/register", this.authController.registerUser);
        this.router.post("/registerPro", this.authController.registerPromotor);
        this.router.post("/login", this.authController.loginUser);
        this.router.post("/loginPro", this.authController.loginPromotor);
        this.router.patch("/verify/:token", this.authController.verifyUser);
        this.router.patch("/verifyPro/:token", this.authController.verifyPromotor);
    }
    getRouter() {
        return this.router;
    }
}
exports.AuthRouter = AuthRouter;
