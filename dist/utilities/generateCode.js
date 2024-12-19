"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateRefCode = void 0;
const generateRefCode = () => {
    return Math.random().toString(36).substring(2, 8).toUpperCase();
};
exports.generateRefCode = generateRefCode;
