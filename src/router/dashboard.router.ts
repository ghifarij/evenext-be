import { Router } from "express";
import { DashboardController } from "../controller/dashboard.controller";
import { verifyTokenPro } from "../middlewares/verify";

export class DashboardRouter {
  private dashboardController: DashboardController;
  private router: Router;

  constructor() {
    this.dashboardController = new DashboardController();
    this.router = Router();
    this.initializeRoutes();
  }

  private initializeRoutes() {
    this.router.get(
      "/eventactive",
      verifyTokenPro,
      this.dashboardController.getEventActive
    );
    this.router.get(
      "/eventfinish",
      verifyTokenPro,
      this.dashboardController.getEventFinish
    );
    this.router.get(
      "/totaltransaction",
      verifyTokenPro,
      this.dashboardController.getTotalTransaction
    );
    this.router.get(
      "/transaction/day",
      verifyTokenPro,
      this.dashboardController.getIncomePerDay
    );
    this.router.get(
      "/transaction/month",
      verifyTokenPro,
      this.dashboardController.getIncomePerMonth
    );
    this.router.get(
      "/transaction/year",
      verifyTokenPro,
      this.dashboardController.getIncomePerYear
    );
  }

  getRouter(): Router {
    return this.router;
  }
}
