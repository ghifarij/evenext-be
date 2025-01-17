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
exports.AuthController = void 0;
const prisma_1 = __importDefault(require("../prisma"));
const bcrypt_1 = require("bcrypt");
const jsonwebtoken_1 = require("jsonwebtoken");
const user_service_1 = require("../services/user.service");
const promotor_service_1 = require("../services/promotor.service");
const mailer_1 = require("../services/mailer");
const path_1 = __importDefault(require("path"));
const fs_1 = __importDefault(require("fs"));
const handlebars_1 = __importDefault(require("handlebars"));
const generateCode_1 = require("../utilities/generateCode");
const date_fns_1 = require("date-fns");
class AuthController {
    registerUser(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { password, confirmPassword, username, email, referred_by } = req.body;
                if (password != confirmPassword)
                    throw { message: "Password not match!" };
                const user = yield (0, user_service_1.findUser)(username, email);
                if (user)
                    throw { message: "Username or email has been used !" };
                const salt = yield (0, bcrypt_1.genSalt)(10);
                const hashPassword = yield (0, bcrypt_1.hash)(password, salt);
                if (!referred_by) {
                    const newUser = yield prisma_1.default.user.create({
                        data: {
                            username,
                            email,
                            password: hashPassword,
                            ref_code: (0, generateCode_1.generateRefCode)(),
                            referred_by,
                        },
                    });
                    const payload = { id: newUser.id };
                    const token = (0, jsonwebtoken_1.sign)(payload, process.env.JWT_KEY, { expiresIn: "60m" });
                    const linkUser = `${process.env.BASE_URL_FE}/verify/${token}`;
                    const templatePath = path_1.default.join(__dirname, "../templates", "verifyUser.hbs");
                    const tempateSource = fs_1.default.readFileSync(templatePath, "utf-8");
                    const compiledTemplate = handlebars_1.default.compile(tempateSource);
                    const html = compiledTemplate({
                        username,
                        linkUser,
                        ref_code: newUser.ref_code,
                    });
                    yield mailer_1.transporter.sendMail({
                        from: "evenext.corp@gmail.com",
                        to: email,
                        subject: "Welcome to Evenext !",
                        html,
                    });
                    res.status(201).send({ message: "Reqister Successfully ✅" });
                    return;
                }
                else {
                    const referrer = yield prisma_1.default.user.findUnique({
                        where: { ref_code: `${referred_by}` },
                    });
                    if (!referrer)
                        throw { message: "Invalid Referral Code !" };
                    const newUser = yield prisma_1.default.user.create({
                        data: {
                            username,
                            email,
                            password: hashPassword,
                            ref_code: (0, generateCode_1.generateRefCode)(),
                            referred_by,
                        },
                    });
                    yield prisma_1.default.coupon.create({
                        data: {
                            isActive: true,
                            expiredAt: (0, date_fns_1.addMonths)(new Date(), 3),
                            userId: newUser.id,
                        },
                    });
                    yield prisma_1.default.point.create({
                        data: {
                            point: 10000,
                            expiredAt: (0, date_fns_1.addMonths)(new Date(), 3),
                            isActive: true,
                            userId: referrer.id,
                        },
                    });
                    const payload = { id: newUser.id };
                    const token = (0, jsonwebtoken_1.sign)(payload, process.env.JWT_KEY, { expiresIn: "60m" });
                    const linkUser = `${process.env.BASE_URL_FE}/verify/${token}`;
                    const templatePath = path_1.default.join(__dirname, "../templates", "verifyUser.hbs");
                    const tempateSource = fs_1.default.readFileSync(templatePath, "utf-8");
                    const compiledTemplate = handlebars_1.default.compile(tempateSource);
                    const html = compiledTemplate({
                        username,
                        linkUser,
                        ref_code: newUser.ref_code,
                    });
                    yield mailer_1.transporter.sendMail({
                        from: "evenext.corp@gmail.com",
                        to: email,
                        subject: "Welcome to Evenext !",
                        html,
                    });
                    res.status(201).send({ message: "Reqister Successfully ✅" });
                    return;
                }
            }
            catch (err) {
                console.log(err);
                res.status(400).send(err);
            }
        });
    }
    loginUser(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { data, password } = req.body;
                const user = yield (0, user_service_1.findUser)(data, data);
                if (!user)
                    throw { message: "Account Not Found !" };
                if (!user.isVerify)
                    throw { message: "Account Not Verify !" };
                const isValidPass = yield (0, bcrypt_1.compare)(password, user.password);
                if (!isValidPass)
                    throw { message: "Incorrect Password !" };
                const payload = { id: user.id, type: "user" };
                const token = (0, jsonwebtoken_1.sign)(payload, process.env.JWT_KEY, { expiresIn: "1d" });
                res.status(200).send({
                    message: "Login Successfully ✅",
                    token,
                });
            }
            catch (err) {
                console.log(err);
                res.status(400).send(err);
            }
        });
    }
    verifyUser(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { token } = req.params;
                console.log(token);
                const verifiedUser = (0, jsonwebtoken_1.verify)(token, process.env.JWT_KEY);
                console.log(verifiedUser);
                yield prisma_1.default.user.update({
                    data: { isVerify: true },
                    where: { id: `${verifiedUser.id}` },
                });
                res.status(200).send({ message: "Verify Successfully ✅" });
            }
            catch (err) {
                console.log(err);
                res.status(400).send(err);
            }
        });
    }
    registerPromotor(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { password, confirmPassword, username, email } = req.body;
                if (password != confirmPassword)
                    throw { message: "Password not match!" };
                const promotor = yield (0, promotor_service_1.findPromotor)(username, email);
                if (promotor)
                    throw { message: "Username or email has been used !" };
                const salt = yield (0, bcrypt_1.genSalt)(10);
                const hashPassword = yield (0, bcrypt_1.hash)(password, salt);
                const newPromotor = yield prisma_1.default.promotor.create({
                    data: { username, email, password: hashPassword },
                });
                const payload = { id: newPromotor.id };
                console.log(payload);
                const token = (0, jsonwebtoken_1.sign)(payload, process.env.JWT_KEY, { expiresIn: "10m" });
                const linkPromotor = `${process.env.BASE_URL_FE}/verifyPro/${token}`;
                const templatePath = path_1.default.join(__dirname, "../templates", "verifyPromotor.hbs");
                const tempateSource = fs_1.default.readFileSync(templatePath, "utf-8");
                const compiledTemplate = handlebars_1.default.compile(tempateSource);
                const html = compiledTemplate({ username, linkPromotor });
                yield mailer_1.transporter.sendMail({
                    from: "evenext.corp@gmail.com",
                    to: email,
                    subject: "Welcome to Evenext Promotor !",
                    html,
                });
                res.status(201).send({ message: "Reqister Successfully ✅" });
            }
            catch (err) {
                console.log(err);
                res.status(400).send(err);
            }
        });
    }
    loginPromotor(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { data, password } = req.body;
                const promotor = yield (0, promotor_service_1.findPromotor)(data, data);
                if (!promotor)
                    throw { message: "Account Not Found !" };
                if (!promotor.isVerify)
                    throw { message: "Account Not Verify !" };
                const isValidPass = yield (0, bcrypt_1.compare)(password, promotor.password);
                if (!isValidPass)
                    throw { message: "Incorrect Password !" };
                const payload = { id: promotor.id, type: "promotor" };
                const token = (0, jsonwebtoken_1.sign)(payload, process.env.JWT_KEY, { expiresIn: "1d" });
                res.status(200).send({
                    message: "Login Successfully ✅",
                    token,
                });
            }
            catch (err) {
                console.log(err);
                res.status(400).send(err);
            }
        });
    }
    verifyPromotor(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { token } = req.params;
                const verifiedPromotor = (0, jsonwebtoken_1.verify)(token, process.env.JWT_KEY);
                yield prisma_1.default.promotor.update({
                    data: { isVerify: true },
                    where: { id: verifiedPromotor.id },
                });
                res.status(200).send({ message: "Verify Successfully ✅" });
            }
            catch (err) {
                console.log(err);
                res.status(400).send(err);
            }
        });
    }
    getSession(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                // Retrieve token from Authorization header
                const authHeader = req.headers.authorization;
                if (!authHeader || !authHeader.startsWith("Bearer ")) {
                    res.status(401).send({ message: "Unauthorized: No token provided" });
                    return;
                }
                const token = authHeader.split(" ")[1];
                if (!token) {
                    res.status(401).send({ message: "Unauthorized: Token missing" });
                    return;
                }
                // Verify token
                const decoded = (0, jsonwebtoken_1.verify)(token, process.env.JWT_KEY);
                if (!decoded || !decoded.type) {
                    res.status(403).send({ message: "Forbidden: Invalid token" });
                    return;
                }
                // Handle different user types
                if (decoded.type === "promotor") {
                    const promotor = yield prisma_1.default.promotor.findUnique({
                        where: { id: decoded.id },
                    });
                    if (!promotor) {
                        res.status(404).send({ message: "Promotor not found" });
                        return;
                    }
                    res.status(200).send({
                        id: promotor.id,
                        type: "promotor",
                        username: promotor.username,
                        email: promotor.email,
                        avatar: promotor.avatar || null,
                    });
                }
                else if (decoded.type === "user") {
                    const user = yield prisma_1.default.user.findUnique({
                        where: { id: decoded.id },
                        select: {
                            id: true,
                            username: true,
                            email: true,
                            avatar: true,
                            createdAt: true,
                            ref_code: true,
                            updatedAt: true,
                            isVerify: true,
                            User_Point: {
                                select: {
                                    point: true,
                                    expiredAt: true,
                                },
                            },
                            User_Coupon: {
                                select: {
                                    id: true,
                                    expiredAt: true,
                                },
                            },
                        },
                    });
                    if (!user) {
                        res.status(404).send({ message: "User not found" });
                        return;
                    }
                    // Calculate total points
                    const totalPoints = user.User_Point.reduce((sum, point) => sum + point.point, 0);
                    res.status(200).json({
                        id: user.id,
                        type: "user",
                        username: user.username,
                        email: user.email,
                        avatar: user.avatar,
                        User_Point: user.User_Point,
                        totalPoints, // Include the calculated total points
                        ref_code: user.ref_code,
                        User_Coupon: user.User_Coupon,
                    });
                }
                else {
                    res.status(403).json({ message: "Forbidden: Unknown token type" });
                }
            }
            catch (err) {
                console.error("Error fetching session:", err);
                res
                    .status(401)
                    .send({ message: "Unauthorized: Invalid or expired token" });
            }
        });
    }
    forgotPasswordUser(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { email } = req.body;
                // Check if the email exists in the database
                const user = yield prisma_1.default.user.findUnique({
                    where: { email },
                });
                if (!user) {
                    res.status(404).send({ message: "Email not found!" });
                    return;
                }
                // Generate a password reset token
                const payload = { id: user.id, email: user.email };
                const resetToken = (0, jsonwebtoken_1.sign)(payload, process.env.JWT_KEY, {
                    expiresIn: "1h", // Token valid for 1 hour
                });
                // Create the password reset link
                const resetLink = `${process.env.BASE_URL_FE}/user/resetPasswordUser/${resetToken}`;
                // Prepare the email template
                const templatePath = path_1.default.join(__dirname, "../templates", "forgotPassword.hbs");
                const templateSource = fs_1.default.readFileSync(templatePath, "utf-8");
                const compiledTemplate = handlebars_1.default.compile(templateSource);
                const html = compiledTemplate({ username: user.username, resetLink });
                // Send the email
                yield mailer_1.transporter.sendMail({
                    from: "evenext.corp@gmail.com",
                    to: email,
                    subject: "Password Reset Request",
                    html,
                });
                res
                    .status(200)
                    .send({ message: "Password reset link sent to your email!" });
            }
            catch (err) {
                console.error(err);
                res
                    .status(500)
                    .send({ message: "An error occurred while sending the reset link." });
            }
        });
    }
    resetPasswordUser(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { token, newPassword, confirmPassword } = req.body;
                console.log("Request body:", req.body);
                if (!token) {
                    res.status(400).send({ message: "Token is required!" });
                    return;
                }
                if (newPassword !== confirmPassword) {
                    res.status(400).send({ message: "Passwords do not match!" });
                    return;
                }
                // Verify the reset token
                let decoded;
                try {
                    decoded = (0, jsonwebtoken_1.verify)(token, process.env.JWT_KEY);
                }
                catch (err) {
                    console.error("Token verification failed:", err);
                    res.status(400).send({ message: "Invalid or expired token!" });
                    return;
                }
                console.log("Token decoded:", decoded);
                // Check if the user exists
                const user = yield prisma_1.default.user.findUnique({
                    where: { id: decoded.id },
                });
                if (!user) {
                    res.status(404).send({ message: "User not found!" });
                    return;
                }
                // Hash the new password
                const salt = yield (0, bcrypt_1.genSalt)(10);
                const hashedPassword = yield (0, bcrypt_1.hash)(newPassword, salt);
                // Update the user's password
                yield prisma_1.default.user.update({
                    where: { id: user.id },
                    data: { password: hashedPassword },
                });
                res
                    .status(200)
                    .send({ message: "Password has been reset successfully!" });
            }
            catch (err) {
                console.error("Error resetting password:", err);
                res.status(500).send({ message: "An internal server error occurred!" });
            }
        });
    }
    forgotPasswordPromotor(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { email } = req.body;
                // Check if the email exists in the database
                const promotor = yield prisma_1.default.promotor.findUnique({
                    where: { email },
                });
                if (!promotor) {
                    res.status(404).send({ message: "Email not found!" });
                    return;
                }
                // Generate a password reset token
                const payload = { id: promotor.id, email: promotor.email };
                const resetToken = (0, jsonwebtoken_1.sign)(payload, process.env.JWT_KEY, {
                    expiresIn: "1h", // Token valid for 1 hour
                });
                // Create the password reset link
                const resetLink = `${process.env.BASE_URL_FE}/promotor/resetPasswordPromotor/${resetToken}`;
                // Prepare the email template
                const templatePath = path_1.default.join(__dirname, "../templates", "forgotPassword.hbs");
                const templateSource = fs_1.default.readFileSync(templatePath, "utf-8");
                const compiledTemplate = handlebars_1.default.compile(templateSource);
                const html = compiledTemplate({ username: promotor.username, resetLink });
                // Send the email
                yield mailer_1.transporter.sendMail({
                    from: "evenext.corp@gmail.com",
                    to: email,
                    subject: "Password Reset Request",
                    html,
                });
                res
                    .status(200)
                    .send({ message: "Password reset link sent to your email!" });
            }
            catch (err) {
                console.error(err);
                res
                    .status(500)
                    .send({ message: "An error occurred while sending the reset link." });
            }
        });
    }
    resetPasswordPromotor(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { token, newPassword, confirmPassword } = req.body;
                console.log("Request body:", req.body);
                if (!token) {
                    res.status(400).send({ message: "Token is required!" });
                    return;
                }
                if (newPassword !== confirmPassword) {
                    res.status(400).send({ message: "Passwords do not match!" });
                    return;
                }
                // Verify the reset token
                let decoded;
                try {
                    decoded = (0, jsonwebtoken_1.verify)(token, process.env.JWT_KEY);
                }
                catch (err) {
                    console.error("Token verification failed:", err);
                    res.status(400).send({ message: "Invalid or expired token!" });
                    return;
                }
                console.log("Token decoded:", decoded);
                // Check if the promotor exists
                const promotor = yield prisma_1.default.promotor.findUnique({
                    where: { id: decoded.id },
                });
                if (!promotor) {
                    res.status(404).send({ message: "Promotor not found!" });
                    return;
                }
                // Hash the new password
                const salt = yield (0, bcrypt_1.genSalt)(10);
                const hashedPassword = yield (0, bcrypt_1.hash)(newPassword, salt);
                // Update the promotor's password
                yield prisma_1.default.promotor.update({
                    where: { id: promotor.id },
                    data: { password: hashedPassword },
                });
                res
                    .status(200)
                    .send({ message: "Password has been reset successfully!" });
            }
            catch (err) {
                console.error("Error resetting password:", err);
                res.status(500).send({ message: "An internal server error occurred!" });
            }
        });
    }
}
exports.AuthController = AuthController;
