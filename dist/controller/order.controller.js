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
exports.OrderController = void 0;
const prisma_1 = __importDefault(require("../prisma"));
const midtransClient = require("midtrans-client");
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
class OrderController {
    createOrder(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a;
            try {
                const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.id;
                const { total_price, coupon, point, final_price, orderCart } = req.body;
                const expiredAt = new Date(new Date().getTime() + 30 * 60 * 1000);
                if (!orderCart || !Array.isArray(orderCart)) {
                    throw new Error("Invalid orderCart data. Ensure it's an array of items.");
                }
                const orderId = yield prisma_1.default.$transaction((prisma) => __awaiter(this, void 0, void 0, function* () {
                    if (coupon) {
                        const coupon = yield prisma.coupon.findFirst({
                            where: { userId: userId },
                        });
                        yield prisma.coupon.update({
                            where: { id: coupon === null || coupon === void 0 ? void 0 : coupon.id },
                            data: { isActive: false },
                        });
                    }
                    if (point) {
                        yield prisma.point.updateMany({
                            where: { userId: userId },
                            data: { isActive: false },
                        });
                    }
                    const { id } = yield prisma.order.create({
                        data: {
                            userId: userId,
                            total_price,
                            final_price,
                            status: "Pending",
                            coupon,
                            point,
                            expiredAt,
                        },
                    });
                    yield Promise.all(orderCart.map((item) => __awaiter(this, void 0, void 0, function* () {
                        if (item.qty > item.ticket.seats) {
                            throw new Error(`Insufficient seats for ticket ID: ${item.ticket.id}`);
                        }
                        yield prisma.order_Details.create({
                            data: {
                                orderId: id,
                                ticketId: item.ticket.id,
                                qty: item.qty,
                                subtotal: item.qty * item.ticket.price,
                            },
                        });
                        yield prisma.ticket.update({
                            where: { id: item.ticket.id },
                            data: { seats: { decrement: item.qty } },
                        });
                    })));
                    return id;
                }));
                res
                    .status(201)
                    .send({ message: "Order created successfully", order_id: orderId });
            }
            catch (error) {
                console.error(error);
                res.status(400).send({ error: "Failed to create order", details: error });
            }
        });
    }
    getOrderId(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const order = yield prisma_1.default.order.findUnique({
                    where: { id: +req.params.id },
                    select: {
                        expiredAt: true,
                        coupon: true,
                        point: true,
                        total_price: true,
                        final_price: true,
                        Order_Details: {
                            select: {
                                qty: true,
                                subtotal: true,
                                ticket: {
                                    select: {
                                        category: true,
                                        price: true,
                                        event: {
                                            select: {
                                                title: true,
                                                thumbnail: true,
                                                date: true,
                                                time: true,
                                                location: true,
                                                venue: true,
                                            },
                                        },
                                    },
                                },
                            },
                        },
                    },
                });
                res.status(200).send({ result: order });
            }
            catch (err) {
                console.log(err);
                res.status(400).send(err);
            }
        });
    }
    getSnapToken(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a, _b;
            try {
                const { order_id } = req.body;
                const item_details = [];
                const checkTransaction = yield prisma_1.default.order.findUnique({
                    where: { id: order_id },
                    select: { status: true, expiredAt: true, coupon: true, point: true },
                });
                if ((checkTransaction === null || checkTransaction === void 0 ? void 0 : checkTransaction.status) === "Cancel")
                    throw "Status transaksi sudah menjadi cancel";
                const ticketTransaction = yield prisma_1.default.order_Details.findMany({
                    where: { orderId: order_id },
                    include: {
                        ticket: {
                            select: {
                                category: true,
                            },
                        },
                    },
                });
                const user = yield prisma_1.default.user.findUnique({
                    where: { id: (_a = req.user) === null || _a === void 0 ? void 0 : _a.id },
                });
                for (const item of ticketTransaction) {
                    item_details.push({
                        id: item.ticketId,
                        price: item.subtotal / item.qty,
                        quantity: item.qty,
                        name: item.ticket.category,
                    });
                }
                if (checkTransaction === null || checkTransaction === void 0 ? void 0 : checkTransaction.coupon) {
                    const coupon = yield prisma_1.default.coupon.findFirst({
                        where: { userId: user === null || user === void 0 ? void 0 : user.id },
                    });
                    item_details.push({
                        id: coupon === null || coupon === void 0 ? void 0 : coupon.id,
                        price: -(req.body.total_price - checkTransaction.point) / 10,
                        quantity: 1,
                        name: "Coupon",
                    });
                }
                if (checkTransaction && (checkTransaction === null || checkTransaction === void 0 ? void 0 : checkTransaction.point) > 0) {
                    const points = yield prisma_1.default.point.findMany({
                        where: { userId: (_b = req.user) === null || _b === void 0 ? void 0 : _b.id },
                        select: { point: true },
                        orderBy: { createdAt: "asc" },
                    });
                    item_details.push({
                        id: points[0].point,
                        price: -checkTransaction.point,
                        quantity: 1,
                        name: "Points",
                    });
                }
                const resMinutes = new Date(`${checkTransaction === null || checkTransaction === void 0 ? void 0 : checkTransaction.expiredAt}`).getTime() -
                    new Date().getTime();
                const snap = new midtransClient.Snap({
                    isProduction: false,
                    serverKey: `${process.env.MID_SERVER_KEY}`,
                });
                const parameters = {
                    transaction_details: req.body,
                    customer_details: {
                        user_name: user === null || user === void 0 ? void 0 : user.username,
                        email: user === null || user === void 0 ? void 0 : user.email,
                    },
                    item_details,
                    page_expiry: {
                        duration: new Date(resMinutes).getMinutes(),
                        unit: "minutes",
                    },
                    expiry: {
                        unit: "minutes",
                        duration: new Date(resMinutes).getMinutes(),
                    },
                };
                const transaction = yield snap.createTransaction(parameters);
                res.status(200).send({ result: transaction.token });
            }
            catch (err) {
                console.log(err);
                res.status(400).send(err);
            }
        });
    }
    midtransWebHook(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { transaction_status, order_id } = req.body;
                let statusTransaction = "Pending";
                if (transaction_status === "settlement") {
                    statusTransaction = "Paid";
                }
                else if (transaction_status === "cancel") {
                    statusTransaction = "Cancel";
                }
                if (statusTransaction === "Cancel") {
                    const tickets = yield prisma_1.default.order_Details.findMany({
                        where: { orderId: +order_id },
                        select: {
                            qty: true,
                            ticketId: true,
                        },
                    });
                    for (const item of tickets) {
                        yield prisma_1.default.ticket.update({
                            where: { id: item.ticketId },
                            data: { seats: { increment: item.qty } },
                        });
                    }
                }
                yield prisma_1.default.order.update({
                    where: { id: +order_id },
                    data: {
                        status: statusTransaction,
                    },
                });
                res.status(200).send({ message: "Order berhasil" });
            }
            catch (err) {
                console.log(err);
                res.status(400).send(err);
            }
        });
    }
}
exports.OrderController = OrderController;
