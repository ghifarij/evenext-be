import { Router } from "express";
import { EventController } from "../controller/event.controller";
import { uploader } from "../services/uploader";
import { verifyTokenPro } from "../middlewares/verify";

export class EventRouter {
  private eventController: EventController;
  private router: Router;

  constructor() {
    this.eventController = new EventController();
    this.router = Router();
    this.initializeRoutes();
  }

  private initializeRoutes() {
    this.router.get("/", this.eventController.getEvents);
    this.router.post(
      "/",
      verifyTokenPro,
      uploader("memoryStorage", "event").single("thumbnail"),
      this.eventController.createEvent
    );
    this.router.get("/all", this.eventController.getAllEvents);

    this.router.get("/:slug", this.eventController.getEventSlug);
  }

  getRouter(): Router {
    return this.router;
  }
}
