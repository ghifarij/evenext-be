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
exports.DashboardController = void 0;
const prisma_1 = __importDefault(require("../prisma"));
class DashboardController {
    getEventActive(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a;
            try {
                const promotorId = (_a = req.promotor) === null || _a === void 0 ? void 0 : _a.id;
                if (!promotorId) {
                    res.status(400).send({ message: "Invalid Promotor ID" });
                }
                const activeEvent = yield prisma_1.default.event.count({
                    where: {
                        promotorId: promotorId,
                        status: "active",
                    },
                });
                res
                    .status(200)
                    .send({ message: "Get Event Actice Succesfull ✅", activeEvent });
            }
            catch (err) {
                console.log(err);
                res.status(400).send(err);
            }
        });
    }
    getEventFinish(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a;
            try {
                const promotorId = (_a = req.promotor) === null || _a === void 0 ? void 0 : _a.id;
                if (!promotorId) {
                    res.status(400).send({ message: "Invalid Promotor ID" });
                }
                const finishEvent = yield prisma_1.default.event.count({
                    where: {
                        promotorId: promotorId,
                        status: "finish",
                    },
                });
                res
                    .status(200)
                    .send({ message: "Get Event Finish Succesfull ✅", finishEvent });
            }
            catch (err) {
                console.log(err);
                res.status(400).send(err);
            }
        });
    }
    getTotalTransaction(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a, _b;
            try {
                const promotorId = (_a = req.promotor) === null || _a === void 0 ? void 0 : _a.id;
                if (!promotorId) {
                    res.status(400).send({ error: "Invalid promotor ID" });
                }
                // Total transaksi dari transaksi pengguna lain yang membeli tiket event userId
                const eventTransactions = yield prisma_1.default.order.aggregate({
                    _sum: {
                        final_price: true,
                    },
                    where: {
                        status: "Paid",
                        Order_Details: {
                            some: {
                                ticket: {
                                    event: {
                                        promotor: {
                                            id: promotorId,
                                        },
                                    },
                                },
                            },
                        },
                    },
                });
                // Hitung total transaksi dari kedua sumber
                const totalTransaction = ((_b = eventTransactions._sum) === null || _b === void 0 ? void 0 : _b.final_price) || 0;
                res.status(200).send({
                    message: "Get Total Transaction Succesfull ✅",
                    totalTransaction,
                });
            }
            catch (error) {
                console.error("Error fetching total transaction: ", error);
                res.status(500).send({ message: "Internal Server Error" });
            }
        });
    }
    getIncomePerDay(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a;
            try {
                const promotorId = (_a = req.promotor) === null || _a === void 0 ? void 0 : _a.id;
                if (!promotorId) {
                    res
                        .status(401)
                        .send({ message: "Unauthorized: promotor not logged in" });
                }
                const transactions = yield prisma_1.default.order.findMany({
                    where: {
                        status: "Paid",
                        OR: [
                            {
                                Order_Details: {
                                    some: {
                                        ticket: {
                                            event: {
                                                promotor: {
                                                    id: promotorId, // Pendapatan dari event milik user
                                                },
                                            },
                                        },
                                    },
                                },
                            },
                        ],
                    },
                    select: {
                        createdAt: true,
                        final_price: true,
                    },
                    orderBy: {
                        createdAt: "asc",
                    },
                });
                const incomePerDay = transactions.reduce((acc, transaction) => {
                    const date = transaction.createdAt.toISOString().split("T")[0]; // Ambil bagian tanggal
                    if (!acc[date]) {
                        acc[date] = 0;
                    }
                    acc[date] += transaction.final_price || 0; // Tambahkan finalPrice
                    return acc;
                }, {});
                const formattedData = Object.entries(incomePerDay).map(([date, totalIncome]) => ({
                    date,
                    totalIncome,
                }));
                res.status(200).send({ incomePerDay: formattedData });
            }
            catch (error) {
                console.error("Error fetching income per day: ", error);
                res.status(500).send({ message: "Internal Server Error" });
            }
        });
    }
    getIncomePerMonth(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a;
            try {
                const promotorId = (_a = req.promotor) === null || _a === void 0 ? void 0 : _a.id;
                if (!promotorId) {
                    res
                        .status(401)
                        .send({ message: "Unauthorized: promotor not logged in" });
                }
                const transactions = yield prisma_1.default.order.findMany({
                    where: {
                        status: "Paid",
                        OR: [
                            {
                                Order_Details: {
                                    some: {
                                        ticket: {
                                            event: {
                                                promotor: {
                                                    id: promotorId,
                                                },
                                            },
                                        },
                                    },
                                },
                            },
                        ],
                    },
                    select: {
                        createdAt: true,
                        final_price: true,
                    },
                    orderBy: {
                        createdAt: "asc",
                    },
                });
                const incomePerMonth = transactions.reduce((acc, transaction) => {
                    const month = transaction.createdAt.toISOString().slice(0, 7); // Format YYYY-MM
                    if (!acc[month]) {
                        acc[month] = 0;
                    }
                    acc[month] += transaction.final_price || 0;
                    return acc;
                }, {});
                const formattedIncome = Object.entries(incomePerMonth).map(([month, totalIncome]) => ({
                    month,
                    totalIncome,
                }));
                res.status(200).send({ incomePerMonth: formattedIncome });
            }
            catch (error) {
                console.error("Error fetching income per month: ", error);
                res.status(500).send({ message: "Internal Server Error" });
            }
        });
    }
    getIncomePerYear(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a;
            try {
                const promotorId = (_a = req.promotor) === null || _a === void 0 ? void 0 : _a.id;
                if (!promotorId) {
                    res
                        .status(401)
                        .send({ message: "Unauthorized: promotor not logged in" });
                }
                const transactions = yield prisma_1.default.order.findMany({
                    where: {
                        status: "Paid",
                        OR: [
                            {
                                Order_Details: {
                                    some: {
                                        ticket: {
                                            event: {
                                                promotor: {
                                                    id: promotorId,
                                                },
                                            },
                                        },
                                    },
                                },
                            },
                        ],
                    },
                    select: {
                        createdAt: true,
                        final_price: true,
                    },
                    orderBy: {
                        createdAt: "asc",
                    },
                });
                const incomePerYear = transactions.reduce((acc, transaction) => {
                    const year = transaction.createdAt.toISOString().slice(0, 4); // Format YYYY
                    if (!acc[year]) {
                        acc[year] = 0;
                    }
                    acc[year] += transaction.final_price || 0;
                    return acc;
                }, {});
                const formattedIncome = Object.entries(incomePerYear).map(([year, totalIncome]) => ({
                    year,
                    totalIncome,
                }));
                res.status(200).send({ incomePerYear: formattedIncome });
            }
            catch (error) {
                console.error("Error fetching income per year: ", error);
                res.status(500).send({ message: "Internal Server Error" });
            }
        });
    }
    getTicketSales(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                // Grouping data berdasarkan `orderId` untuk menghasilkan struktur mirip `IOrder`
                const orders = yield prisma_1.default.order.findMany({
                    include: {
                        Order_Details: {
                            include: {
                                ticket: {
                                    include: {
                                        event: true, // Mengambil detail event
                                    },
                                },
                            },
                        },
                    },
                });
                // Mapping hasil untuk sesuai dengan struktur `IOrder`
                const formattedOrders = orders.map((order) => ({
                    expiredAt: order.expiredAt,
                    coupon: order.coupon,
                    point: order.point,
                    total_price: order.total_price,
                    final_price: order.final_price,
                    Order_Details: order.Order_Details.map((detail) => ({
                        qty: detail.qty,
                        subtotal: detail.subtotal,
                        ticket: {
                            category: detail.ticket.category,
                            price: detail.ticket.price,
                            event: {
                                title: detail.ticket.event.title,
                                thumbnail: detail.ticket.event.thumbnail,
                                date: detail.ticket.event.date,
                                time: detail.ticket.event.time,
                                location: detail.ticket.event.location,
                                venue: detail.ticket.event.venue,
                            },
                        },
                    })),
                }));
                res.status(200).json({ success: true, data: formattedOrders });
            }
            catch (error) {
                console.error("Error fetching ticket sales:", error);
                res.status(500).json({ success: false, message: "Internal Server Error" });
            }
        });
    }
}
exports.DashboardController = DashboardController;
