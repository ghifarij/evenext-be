import { Router } from "express";
import { TicketController } from "../controller/ticket.controller";

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
  }

  getRouter(): Router {
    return this.router;
  }
}
