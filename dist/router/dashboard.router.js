"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DashboardRouter = void 0;
const express_1 = require("express");
const dashboard_controller_1 = require("../controller/dashboard.controller");
const verify_1 = require("../middlewares/verify");
class DashboardRouter {
    constructor() {
        this.dashboardController = new dashboard_controller_1.DashboardController();
        this.router = (0, express_1.Router)();
        this.initializeRoutes();
    }
    initializeRoutes() {
        this.router.get("/eventactive", verify_1.verifyTokenPro, this.dashboardController.getEventActive);
        this.router.get("/eventfinish", verify_1.verifyTokenPro, this.dashboardController.getEventFinish);
        this.router.get("/totaltransaction", verify_1.verifyTokenPro, this.dashboardController.getTotalTransaction);
        this.router.get("/transaction/day", verify_1.verifyTokenPro, this.dashboardController.getIncomePerDay);
        this.router.get("/transaction/month", verify_1.verifyTokenPro, this.dashboardController.getIncomePerMonth);
        this.router.get("/transaction/year", verify_1.verifyTokenPro, this.dashboardController.getIncomePerYear);
        this.router.get("/ticketsales", verify_1.verifyTokenPro, this.dashboardController.getTicketSales);
    }
    getRouter() {
        return this.router;
    }
}
exports.DashboardRouter = DashboardRouter;
