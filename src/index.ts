import express, { Application, Request, Response } from "express";
import cors from "cors";
import { EventRouter } from "./router/event.router";
import { TicketRouter } from "./router/ticket.router";
import { UserRouter } from "./router/user.router";
import { AuthRouter } from "./router/auth.router";
import cookieParser from "cookie-parser";
import path from "path";

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
  res.status(200).send("Welcome to my expense API");
});

app.use("/api/public", express.static(path.join(__dirname, "../public")));

const eventRouter = new EventRouter();
const ticketRouter = new TicketRouter();
const userRouter = new UserRouter();
const authRouter = new AuthRouter();

app.use("/api/events", eventRouter.getRouter());
app.use("/api/tickets", ticketRouter.getRouter());
app.use("/api/users", userRouter.getRouter());
app.use("/api/auth", authRouter.getRouter());

console.log(process.env.NODE_ENV === "production");
console.log(process.env.BASE_URL_FE);

app.listen(PORT, () => {
  console.log(`server running on http://localhost:${PORT}/api`);
});
