import { Router } from "express"
import { AuthController } from "../controller/auth.controller";

export class AuthRouter {
    private authController : AuthController
    private router: Router

    constructor() {
        this.authController = new AuthController();
        this.router = Router();
        this.initializeRoutes();
    }

    private initializeRoutes() {
        this.router.get("/getSession", this.authController.getSession)

        this.router.post("/register", this.authController.registerUser)
        this.router.post("/registerPro", this.authController.registerPromotor)
        this.router.post("/login", this.authController.loginUser)
        this.router.post("/loginPro", this.authController.loginPromotor)

        this.router.patch("/verify/:token", this.authController.verifyUser)
        this.router.patch("/verifyPro/:token", this.authController.verifyPromotor)
    }

    getRouter(): Router {
        return this.router;
    }
}