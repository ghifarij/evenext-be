import { Router } from "express";
// import { checkpromotor, verifyToken} from "../middlewares/verify"
import { PromotorController} from "../controller/promotor.controller";
import { uploader } from "../services/uploader";
import { checkPromotor, verifyTokenPro } from "../middlewares/verify";

export class PromotorRouter {
  private promotorController: PromotorController;
  private router: Router;

  constructor() {
    this.promotorController = new PromotorController();
    this.router = Router();
    this.initializeRoutes();
  }
  private initializeRoutes() {
    this.router.get("/", verifyTokenPro, checkPromotor, this.promotorController.getPromotors);
    this.router.post("/", verifyTokenPro, this.promotorController.createPromotor);
    this.router.patch(
      "/avatar",
      verifyTokenPro,
      uploader("memoryStorage", "avatar-", "/avatar").single("file"),
      this.promotorController.editAvatarPro
    );
    this.router.patch(
      "/avatar-cloud",
      verifyTokenPro,
      uploader("memoryStorage", "avatar").single("file"),
      this.promotorController.editAvatarProCloud
    );
    
    this.router.get("/:id", this.promotorController.getPromotorsId);
    this.router.patch("/:id", this.promotorController.editPromotor);
    this.router.delete("/:id", this.promotorController.deletePromotor);
  }
  getRouter(): Router {
    return this.router;
  }
}
