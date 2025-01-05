"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.TicketController = void 0;
const prisma_1 = __importDefault(require("../prisma"));
class TicketController {
    createTicket(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const tickets = req.body;
                const { eventId } = req.params;
                if (!eventId) {
                    return res.status(400).json({ error: "eventId is required" });
                }
                const event = yield prisma_1.default.event.findUnique({
                    where: { id: Number(eventId) },
                });
                if (!event) {
                    return res.status(404).json({ error: "Event not found" });
                }
                const createdTickets = yield Promise.all(tickets.map((ticket) => prisma_1.default.ticket.create({
                    data: {
                        category: ticket.category,
                        seats: ticket.seats,
                        price: ticket.price,
                        event: {
                            connect: {
                                id: Number(eventId),
                            },
                        },
                    },
                })));
                res.status(201).send({ createdTickets });
            }
            catch (err) {
                console.error(err);
                res.status(500).send(err);
            }
        });
    }
    getTickets(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const tickets = yield prisma_1.default.ticket.findMany({
                    select: {
                        id: true,
                        category: true,
                        seats: true,
                        price: true,
                        eventId: true,
                    },
                });
                res.status(200).send({ tickets });
            }
            catch (err) {
                console.log(err);
                res.status(400).send(err);
            }
        });
    }
}
exports.TicketController = TicketController;
