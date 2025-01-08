"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TicketRouter = void 0;
const express_1 = require("express");
const ticket_controller_1 = require("../controller/ticket.controller");
const asyncHandler_1 = require("../middlewares/asyncHandler");
const verify_1 = require("../middlewares/verify");
class TicketRouter {
    constructor() {
        this.ticketController = new ticket_controller_1.TicketController();
        this.router = (0, express_1.Router)();
        this.initializeRoutes();
    }
    initializeRoutes() {
        this.router.get("/", this.ticketController.getTickets);
        this.router.post("/:eventId", verify_1.verifyTokenPro, (0, asyncHandler_1.asyncHandler)(this.ticketController.createTicket));
    }
    getRouter() {
        return this.router;
    }
}
exports.TicketRouter = TicketRouter;
