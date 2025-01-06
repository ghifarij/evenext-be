import { Router } from "express";
import { TicketController } from "../controller/ticket.controller";
import { asyncHandler } from "../middlewares/asyncHandler";
import { verifyTokenPro } from "../middlewares/verify";

export class TicketRouter {
  private ticketController: TicketController;
  private router: Router;

  constructor() {
    this.ticketController = new TicketController();
    this.router = Router();
    this.initializeRoutes();
  }

  private initializeRoutes() {
    this.router.get("/", this.ticketController.getTickets);

    this.router.post(
      "/:eventId",
      verifyTokenPro,
      asyncHandler(this.ticketController.createTicket)
    );
  }

  getRouter(): Router {
    return this.router;
  }
}
