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
exports.UserController = void 0;
const client_1 = require("../../prisma/generated/client");
const prisma_1 = __importDefault(require("../prisma"));
const uuid_1 = require("uuid");
const cloudinary_1 = require("../services/cloudinary");
class UserController {
    getUsers(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            console.log(req.user);
            try {
                const { search, page = 1, limit = 5 } = req.query;
                const filter = {};
                if (search) {
                    filter.OR = [
                        { username: { contains: search, mode: "insensitive" } },
                        { email: { contains: search, mode: "insensitive" } },
                    ];
                }
                const countUser = yield prisma_1.default.user.count({ where: filter });
                const total_page = Math.ceil(countUser / +limit);
                const users = yield prisma_1.default.user.findMany({
                    where: filter,
                    orderBy: { id: "asc" },
                    take: +limit,
                    skip: +limit * (+page - 1),
                });
                res.status(200).send({ total_page, page, users });
            }
            catch (err) {
                console.log(err);
                res.status(400).send(err);
            }
        });
    }
    getUsersId(req, res, next) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { id } = req.params;
                if (!(0, uuid_1.validate)(id)) {
                    res.status(400).json({ message: "Invalid UUID format" });
                    return;
                }
                const user = yield prisma_1.default.user.findUnique({
                    where: { id },
                });
                if (!user) {
                    res.status(404).json({ message: "User Not Found" });
                    return;
                }
                res.status(200).send({ user });
            }
            catch (err) {
                console.log(err);
                res.status(400).send(err);
            }
        });
    }
    createUser(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { username, email, password } = req.body;
                if (!username || !email || !password) {
                    res.status(400).json({ message: "Missing required fields" });
                    return;
                }
                const ref_code = "DEFAULT_CODE";
                const newUser = yield prisma_1.default.user.create({
                    data: { username, email, password, ref_code },
                });
                res.status(201).send({ message: "User Created! ✅", user: newUser });
            }
            catch (err) {
                if (err instanceof client_1.Prisma.PrismaClientKnownRequestError &&
                    err.code === "P2002") {
                    res.status(400).json({
                        message: "Duplicate field value violates a unique constraint",
                    });
                    return;
                }
                console.log(err);
                res.status(400).send(err);
            }
        });
    }
    editUser(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { id } = req.params;
                const updatedUser = yield prisma_1.default.user.update({
                    data: req.body,
                    where: { id },
                });
                res.status(200).send({ message: "User Updated! ✅", user: updatedUser });
            }
            catch (err) {
                console.log(err);
                res.status(400).send(err);
            }
        });
    }
    deleteUser(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { id } = req.params;
                yield prisma_1.default.user.delete({ where: { id } });
                res.status(200).send("User Deleted! ✅");
            }
            catch (err) {
                console.log(err);
                res.status(400).send(err);
            }
        });
    }
    editAvatar(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a;
            try {
                if (!req.file)
                    throw { message: "File is Empty!" };
                const link = `http://localhost:8000/api/public/avatar/${req.file.filename}`;
                yield prisma_1.default.user.update({
                    data: { avatar: link },
                    where: { id: (_a = req.user) === null || _a === void 0 ? void 0 : _a.id },
                });
                res.status(200).send({ message: "Avatar Edited! ✅" });
            }
            catch (err) {
                console.log(err);
                res.status(400).send(err);
            }
        });
    }
    editAvatarCloud(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a;
            try {
                if (!req.file)
                    throw { message: "File is Empty!" };
                const { secure_url } = yield (0, cloudinary_1.cloudinaryUpload)(req.file, "avatar");
                yield prisma_1.default.user.update({
                    data: { avatar: secure_url },
                    where: { id: (_a = req.user) === null || _a === void 0 ? void 0 : _a.id },
                });
                res.status(200).send({ message: "Avatar Edited! ✅" });
            }
            catch (err) {
                console.log(err);
                res.status(400).send(err);
            }
        });
    }
    getUserCoupon(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a;
            try {
                const coupon = yield prisma_1.default.coupon.findFirst({
                    where: {
                        AND: [
                            { userId: (_a = req.user) === null || _a === void 0 ? void 0 : _a.id },
                            { expiredAt: { gt: new Date() } },
                            { isActive: true },
                        ],
                    },
                    select: { isActive: true },
                });
                res.status(200).send({ result: coupon === null || coupon === void 0 ? void 0 : coupon.isActive });
            }
            catch (err) {
                console.log(err);
                res.status(400).send(err);
            }
        });
    }
    getPointsUser(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a;
            try {
                const points = yield prisma_1.default.point.aggregate({
                    where: {
                        AND: [
                            { userId: (_a = req.user) === null || _a === void 0 ? void 0 : _a.id },
                            { isActive: true },
                            { expiredAt: { gt: new Date() } },
                        ],
                    },
                    _sum: { point: true },
                });
                res.status(200).send({ result: points._sum.point });
            }
            catch (err) {
                console.log(err);
                res.status(400).send(err);
            }
        });
    }
}
exports.UserController = UserController;
