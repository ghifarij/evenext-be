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
                const customerId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.id;
                const { totalPrice, finalPrice, orderCart } = req.body;
                const expiredAt = new Date(new Date().getTime() + 10 * 60 * 1000);
                // Create the order
                const { id } = yield prisma_1.default.order.create({
                    data: {
                        userId: customerId,
                        total_price: totalPrice,
                        final_price: finalPrice,
                        expiredAt,
                        status: "Pending",
                    },
                });
                // Process each item in the order cart
                for (const order of orderCart) {
                    const ticket = yield prisma_1.default.ticket.findUnique({
                        where: { id: order.ticket.id },
                    });
                    if (!ticket) {
                        throw new Error(`Ticket with ID ${order.ticket.id} not found`);
                    }
                    const subTotalPrice = ticket.price * order.quantity;
                    // Create order details
                    yield prisma_1.default.order_Details.create({
                        data: {
                            orderId: id,
                            ticketId: order.ticket.id,
                            qty: order.quantity,
                        },
                    });
                    // Decrease ticket quantity
                    yield prisma_1.default.ticket.update({
                        where: { id: order.ticket.id },
                        data: { seats: { decrement: order.quantity } },
                    });
                }
                res
                    .status(201)
                    .send({ message: "Order created successfully", orderId: id });
            }
            catch (error) {
                console.error(error);
                res.status(400).send({ error: "Failed to create order", details: error });
            }
        });
    }
    getOrderDetail(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const order = yield prisma_1.default.order.findUnique({
                    where: { id: parseInt(req.params.orderId) },
                    include: {
                        Order_Details: {
                            include: {
                                ticket: {
                                    include: {
                                        event: true,
                                    },
                                },
                            },
                        },
                    },
                });
                if (!order) {
                    throw new Error("Order not found");
                }
                res.status(200).send(order);
            }
            catch (err) {
                console.error(err);
                res.status(400).send({ message: err });
            }
        });
    }
    getOrderToken(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { order_id } = req.body;
                const activeOrder = yield prisma_1.default.order.findUnique({
                    where: { id: order_id },
                });
                if (!activeOrder || activeOrder.status === "Cancel") {
                    throw new Error("Order is not active or has been canceled.");
                }
                const orderDetails = yield prisma_1.default.order_Details.findMany({
                    where: { orderId: order_id },
                    include: { ticket: true },
                });
                const customer = yield prisma_1.default.user.findUnique({
                    where: { id: activeOrder.userId },
                });
                const snap = new midtransClient.Snap({
                    isProduction: false,
                    serverKey: process.env.MIDTRANS_SERVER_KEY,
                });
                const items = orderDetails.map((detail) => ({
                    id: detail.ticketId.toString(),
                    name: detail.ticket.category,
                    price: detail.ticket.price,
                    quantity: detail.qty,
                }));
                const parameter = {
                    transaction_details: {
                        order_id: order_id.toString(),
                        gross_amount: activeOrder.final_price,
                    },
                    customer_details: {
                        first_name: customer === null || customer === void 0 ? void 0 : customer.username,
                        email: customer === null || customer === void 0 ? void 0 : customer.email,
                    },
                    item_details: items,
                    expiry: {
                        unit: "minutes",
                        duration: Math.ceil((new Date(activeOrder.expiredAt).getTime() - new Date().getTime()) /
                            60000),
                    },
                };
                const transaction = yield snap.createTransaction(parameter);
                res.status(200).send({ orderToken: transaction.token });
            }
            catch (err) {
                console.error(err);
                res.status(400).send({ message: err });
            }
        });
    }
    updateOrder(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { transaction_status, order_id } = req.body;
                let status = transaction_status === "settlement"
                    ? "Paid"
                    : transaction_status === "pending"
                        ? "Pending"
                        : "Cancel";
                if (status === "Cancel") {
                    const details = yield prisma_1.default.order_Details.findMany({
                        where: { orderId: order_id },
                    });
                    for (const detail of details) {
                        yield prisma_1.default.ticket.update({
                            where: { id: detail.ticketId },
                            data: { seats: { increment: detail.qty } },
                        });
                    }
                }
                yield prisma_1.default.order.update({
                    where: { id: order_id },
                    data: { status },
                });
                res.status(200).send({ message: "Order status updated successfully" });
            }
            catch (err) {
                console.error(err);
                res.status(400).send({ message: err });
            }
        });
    }
}
exports.OrderController = OrderController;
