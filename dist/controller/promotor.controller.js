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
exports.PromotorController = void 0;
const prisma_1 = __importDefault(require("../prisma"));
const uuid_1 = require("uuid");
const cloudinary_1 = require("../services/cloudinary");
const client_1 = require("../../prisma/generated/client");
class PromotorController {
    getPromotors(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            console.log(req.promotor);
            try {
                const { search, page = 1, limit = 5 } = req.query;
                const filter = {};
                if (search) {
                    filter.OR = [
                        { username: { contains: search, mode: "insensitive" } },
                        { email: { contains: search, mode: "insensitive" } },
                    ];
                }
                const countPromotor = yield prisma_1.default.promotor.count({ where: filter });
                const total_page = Math.ceil(countPromotor / +limit);
                const promotors = yield prisma_1.default.promotor.findMany({
                    where: filter,
                    orderBy: { id: "asc" },
                    take: +limit,
                    skip: +limit * (+page - 1),
                });
                res.status(200).send({ total_page, page, promotors });
            }
            catch (err) {
                console.log(err);
                res.status(400).send(err);
            }
        });
    }
    getPromotorsId(req, res, next) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { id } = req.params;
                if (!(0, uuid_1.validate)(id)) {
                    res.status(400).json({ message: "Invalid UUID format" });
                    return;
                }
                const promotor = yield prisma_1.default.promotor.findUnique({
                    where: { id },
                });
                if (!promotor) {
                    res.status(404).json({ message: "Promotor Not Found" });
                    return;
                }
                res.status(200).send({ promotor });
            }
            catch (err) {
                console.log(err);
                res.status(400).send(err);
            }
        });
    }
    createPromotor(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { username, email, password } = req.body;
                if (!username || !email || !password) {
                    res.status(400).json({ message: "Missing required fields" });
                    return;
                }
                const newPromotor = yield prisma_1.default.promotor.create({
                    data: { username, email, password },
                });
                res
                    .status(201)
                    .send({ message: "Promotor Created! ✅", promotor: newPromotor });
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
    editPromotor(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { id } = req.params;
                const updatedPromotor = yield prisma_1.default.promotor.update({
                    data: req.body,
                    where: { id: id || "" },
                });
                res
                    .status(200)
                    .send({ message: "Promotor Updated! ✅", promotor: updatedPromotor });
            }
            catch (err) {
                console.log(err);
                res.status(400).send(err);
            }
        });
    }
    deletePromotor(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { id } = req.params;
                yield prisma_1.default.promotor.delete({ where: { id } });
                res.status(200).send({ message: "Promotor Deleted! ✅" });
            }
            catch (err) {
                console.log(err);
                res.status(400).send(err);
            }
        });
    }
    editAvatarPro(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a;
            try {
                if (!req.file)
                    throw { message: "File is Empty!" };
                const link = `http://localhost:8000/api/public/avatar/${req.file.filename}`;
                yield prisma_1.default.promotor.update({
                    data: { avatar: link },
                    where: { id: (_a = req.promotor) === null || _a === void 0 ? void 0 : _a.id },
                });
                res.status(200).send({ message: "Avatar Edited! ✅" });
            }
            catch (err) {
                console.log(err);
                res.status(400).send(err);
            }
        });
    }
    editAvatarProCloud(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a;
            try {
                if (!req.file)
                    throw { message: "File is Empty!" };
                const { secure_url } = yield (0, cloudinary_1.cloudinaryUpload)(req.file, "avatar");
                yield prisma_1.default.promotor.update({
                    data: { avatar: secure_url },
                    where: { id: (_a = req.promotor) === null || _a === void 0 ? void 0 : _a.id },
                });
                res.status(200).send({ message: "Avatar Edited! ✅" });
            }
            catch (err) {
                console.log(err);
                res.status(400).send(err);
            }
        });
    }
}
exports.PromotorController = PromotorController;
