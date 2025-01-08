import { Router } from "express";
// import { checkUser, verifyToken} from "../middlewares/verify"
import { UserController } from "../controller/user.controller";
import { uploader } from "../services/uploader";
import { checkUser, verifyToken } from "../middlewares/verify";

export class UserRouter {
  private userController: UserController;
  private router: Router;

  constructor() {
    this.userController = new UserController();
    this.router = Router();
    this.initializeRoutes();
  }
  private initializeRoutes() {
    this.router.get("/", verifyToken, checkUser, this.userController.getUsers);
    this.router.post("/", verifyToken, this.userController.createUser);
    this.router.patch(
      "/avatar-cloud",
      verifyToken,
      uploader("memoryStorage", "avatar").single("file"),
      this.userController.editAvatarCloud
    );
    this.router.get("/coupon", verifyToken, this.userController.getUserCoupon);
    this.router.get("/points", verifyToken, this.userController.getPointsUser);

    this.router.get("/:id", this.userController.getUsersId);
    this.router.patch("/:id", this.userController.editUser);
    this.router.delete("/:id", this.userController.deleteUser);
  }
  getRouter(): Router {
    return this.router;
  }
}
