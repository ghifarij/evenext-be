"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TicketRouter = void 0;
const express_1 = require("express");
const ticket_controller_1 = require("../controller/ticket.controller");
class TicketRouter {
    constructor() {
        this.ticketController = new ticket_controller_1.TicketController();
        this.router = (0, express_1.Router)();
        this.initializeRoutes();
    }
    initializeRoutes() {
        this.router.get("/", this.ticketController.getTickets);
    }
    getRouter() {
        return this.router;
    }
}
exports.TicketRouter = TicketRouter;
