import { Router } from "express";
// import { checkUser, verifyToken} from "../middlewares/verify"
import { UserController } from "../controller/user.controller";

export class UserRouter {
  private userController: UserController;
  private router: Router;

  constructor() {
    this.userController = new UserController();
    this.router = Router();
    this.initializeRoutes();
  }
  private initializeRoutes() {
    this.router.get("/", this.userController.getUsers);
    this.router.post("/", this.userController.createUser);
    this.router.patch("/avatar", this.userController.editAvatar);
    
    this.router.get("/:id", this.userController.getUsersId);
    this.router.patch("/:id", this.userController.editUser);
    this.router.delete("/:id", this.userController.deleteUser);
  }
  getRouter(): Router {
    return this.router;
  }
}
