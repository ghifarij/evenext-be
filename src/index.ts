import express, { Application, Request, Response } from "express";
import cors from "cors";
import { EventRouter } from "./router/event.router";
import { TicketRouter } from "./router/ticket.router";

const PORT: number = 8000;

const app: Application = express();
app.use(express.json());
app.use(cors());

app.get("/api", (req: Request, res: Response) => {
  res.status(200).send("Welcome to my expense API");
});

const eventRouter = new EventRouter();
const ticketRouter = new TicketRouter();

app.use("/api/events", eventRouter.getRouter());
app.use("/api/tickets", ticketRouter.getRouter());

app.listen(PORT, () => {
  console.log(`server running on http://localhost:${PORT}`);
});
