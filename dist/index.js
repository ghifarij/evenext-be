"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const event_router_1 = require("./router/event.router");
const ticket_router_1 = require("./router/ticket.router");
const user_router_1 = require("./router/user.router");
const auth_router_1 = require("./router/auth.router");
const cookie_parser_1 = __importDefault(require("cookie-parser"));
const path_1 = __importDefault(require("path"));
const PORT = 8000;
const app = (0, express_1.default)();
app.use(express_1.default.json());
app.use((0, cors_1.default)({
    origin: process.env.BASE_URL_FE,
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH"],
}));
app.use((0, cookie_parser_1.default)());
app.get("/api", (req, res) => {
    res.status(200).send("Welcome to my expense API");
});
app.use("/api/public", express_1.default.static(path_1.default.join(__dirname, "../public")));
const eventRouter = new event_router_1.EventRouter();
const ticketRouter = new ticket_router_1.TicketRouter();
const userRouter = new user_router_1.UserRouter();
const authRouter = new auth_router_1.AuthRouter();
app.use("/api/events", eventRouter.getRouter());
app.use("/api/tickets", ticketRouter.getRouter());
app.use("/api/users", userRouter.getRouter());
app.use("/api/auth", authRouter.getRouter());
console.log(process.env.NODE_ENV === "production");
console.log(process.env.BASE_URL_FE);
app.listen(PORT, () => {
    console.log(`server running on http://localhost:${PORT}/api`);
});
