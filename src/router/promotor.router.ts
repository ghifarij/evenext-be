import { Router } from "express";
// import { checkpromotor, verifyToken} from "../middlewares/verify"
import { PromotorController} from "../controller/promotor.controller";

export class PromotorRouter {
  private promotorController: PromotorController;
  private router: Router;

  constructor() {
    this.promotorController = new PromotorController();
    this.router = Router();
    this.initializeRoutes();
  }
  private initializeRoutes() {
    this.router.get("/", this.promotorController.getPromotors);
    this.router.post("/", this.promotorController.createPromotor);
    this.router.patch("/avatar", this.promotorController.editAvatarPro);
    
    this.router.get("/:id", this.promotorController.getPromotorsId);
    this.router.patch("/:id", this.promotorController.editPromotor);
    this.router.delete("/:id", this.promotorController.deletePromotor);
  }
  getRouter(): Router {
    return this.router;
  }
}
