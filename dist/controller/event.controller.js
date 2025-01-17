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
const cloudinary_1 = require("../services/cloudinary");
const client_1 = require("../../prisma/generated/client");
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
                const { search, page = 1, limit = 9, category, location } = req.query;
                const filter = {};
                if (search) {
                    filter.title = { contains: search, mode: "insensitive" };
                }
                if (category &&
                    Object.values(client_1.EventCategory).includes(category)) {
                    filter.category = category;
                }
                if (location &&
                    Object.values(client_1.EventLocation).includes(location)) {
                    filter.location = location;
                }
                const countEvents = yield prisma_1.default.event.aggregate({
                    _count: { _all: true },
                    where: filter,
                });
                const totalPage = Math.ceil(countEvents._count._all / +limit);
                const events = yield prisma_1.default.event.findMany({
                    where: filter,
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
    getEventDetail(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { status } = req.query;
                const eventSelect = {
                    title: true,
                    thumbnail: true,
                    date: true,
                    time: true,
                    status: true,
                    promotor: {
                        select: {
                            id: true,
                            username: true,
                            avatar: true,
                        },
                    },
                    description: true,
                    terms: true,
                };
                const whereClause = { id: +req.params.id };
                if (status && ["active", "finish"].includes(status.toString())) {
                    whereClause.status = status;
                }
                const event = yield prisma_1.default.event.findUnique({
                    where: whereClause,
                    select: eventSelect,
                });
                res.status(200).send({ result: event });
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
    createEvent(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a;
            try {
                if (!req.file)
                    throw { message: "thumbnail empty" };
                const { secure_url } = yield (0, cloudinary_1.cloudinaryUpload)(req.file, "event");
                const { title, slug, date, time, location, venue, category, description, terms, } = req.body;
                const promotorId = (_a = req.promotor) === null || _a === void 0 ? void 0 : _a.id;
                const event = yield prisma_1.default.event.create({
                    data: {
                        thumbnail: secure_url,
                        title,
                        slug,
                        date,
                        time,
                        location,
                        venue,
                        category,
                        description,
                        terms,
                        promotorId,
                    },
                });
                res.status(200).send({ message: "Event created", id: event.id });
            }
            catch (err) {
                console.log(err);
                res.status(400).send(err);
            }
        });
    }
}
exports.EventController = EventController;
