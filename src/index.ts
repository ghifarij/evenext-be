import express, { Application, Request, Response } from "express";
import cors from "cors";
import { EventRouter } from "./router/event.router";
import { TicketRouter } from "./router/ticket.router";
import { UserRouter } from "./router/user.router";
import { AuthRouter } from "./router/auth.router";
import cookieParser from "cookie-parser";
import path from "path";
import { PromotorRouter } from "./router/promotor.router";
import { DashboardRouter } from "./router/dashboard.router";
import { OrderRouter } from "./router/order.router";
import { ReviewRouter } from "./router/review.router";

const PORT: number = 8000;

const app: Application = express();
app.use(express.json());
app.use(
  cors({
    origin: process.env.BASE_URL_FE,
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH"],
  })
);
app.use(cookieParser());

app.get("/api", (req: Request, res: Response) => {
  res.status(200).send("Welcome to my API");
});

app.use("/api/public", express.static(path.join(__dirname, "../public")));

const eventRouter = new EventRouter();
const dashboardRouter = new DashboardRouter();
const ticketRouter = new TicketRouter();
const userRouter = new UserRouter();
const promotorRouter = new PromotorRouter();
const authRouter = new AuthRouter();
const orderRouter = new OrderRouter();
const reviewRouter = new ReviewRouter();

app.use("/api/events", eventRouter.getRouter());
app.use("/api/dashboard", dashboardRouter.getRouter());
app.use("/api/tickets", ticketRouter.getRouter());
app.use("/api/users", userRouter.getRouter());
app.use("/api/promotors", promotorRouter.getRouter());
app.use("/api/auth", authRouter.getRouter());
app.use("/api/orders", orderRouter.getRouter());
app.use("/api/reviews", reviewRouter.getRouter());

console.log(process.env.NODE_ENV === "production");
console.log(process.env.BASE_URL_FE);

app.listen(PORT, () => {
  console.log(`server running on http://localhost:${PORT}/api`);
});
