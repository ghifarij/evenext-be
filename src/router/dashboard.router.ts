import { Router } from "express";
import { DasboardController } from "../controller/dashboard.controller";
import { verifyTokenPro } from "../middlewares/verify";

export class DashboardRouter {
  private dashboardController: DasboardController;
  private router: Router;

  constructor() {
    this.dashboardController = new DasboardController();
    this.router = Router();
    this.initializeRoutes();
  }

  private initializeRoutes() {
    this.router.get(
      "/eventactive",
      verifyTokenPro,
      this.dashboardController.getEventActive
    );
  }

  getRouter(): Router {
    return this.router;
  }
}
