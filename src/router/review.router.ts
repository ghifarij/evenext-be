import { Router } from "express";
import { verifyToken } from "../middlewares/verify";
import { ReviewController } from "../controller/review.controller";

export class ReviewRouter {
  private router: Router;
  private reviewController: ReviewController;

  constructor() {
    this.router = Router();
    this.reviewController = new ReviewController();
    this.initializeRoutes();
  }

  private initializeRoutes() {
    this.router.post("/:id", verifyToken, this.reviewController.createReview);
    this.router.get("/:id", this.reviewController.getReviews);
    this.router.get("/avg/:id", this.reviewController.getAvg);
  }

  getRouter(): Router {
    return this.router;
  }
}
