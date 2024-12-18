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
exports.EventController = void 0;
const prisma_1 = __importDefault(require("../prisma"));
class EventController {
    getEvents(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const events = yield prisma_1.default.event.findMany({
                    select: {
                        id: true,
                        title: true,
                        slug: true,
                        thumbnail: true,
                        date: true,
                        location: true,
                        venue: true,
                    },
                });
                res.status(200).send({ events });
            }
            catch (err) {
                console.log(err);
                res.status(400).send(err);
            }
        });
    }
    getAllEvents(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { page = 1, limit = 9 } = req.query;
                const countEvents = yield prisma_1.default.event.aggregate({
                    _count: { _all: true },
                });
                const totalPage = Math.ceil(countEvents._count._all / +limit);
                const events = yield prisma_1.default.event.findMany({
                    orderBy: { id: "asc" },
                    take: +limit,
                    skip: +limit * (+page - 1),
                });
                res.status(200).send({ totalPage, page: +page, events });
            }
            catch (err) {
                console.log(err);
                res.status(400).send(err);
            }
        });
    }
    getEventSlug(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { slug } = req.params;
                const event = yield prisma_1.default.event.findUnique({
                    where: { slug: slug },
                    select: {
                        id: true,
                        title: true,
                        slug: true,
                        thumbnail: true,
                        description: true,
                        terms: true,
                        category: true,
                        location: true,
                        venue: true,
                        date: true,
                        time: true,
                        promotor: {
                            select: {
                                username: true,
                                email: true,
                                password: true,
                                avatar: true,
                            },
                        },
                        Ticket: {
                            select: {
                                category: true,
                                seats: true,
                                price: true,
                            },
                        },
                    },
                });
                res.status(200).send({ event });
            }
            catch (err) {
                console.log(err);
                res.status(400).send(err);
            }
        });
    }
}
exports.EventController = EventController;
