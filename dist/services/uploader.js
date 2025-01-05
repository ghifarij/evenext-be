"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.uploader = void 0;
const multer_1 = __importDefault(require("multer"));
<<<<<<< HEAD
<<<<<<< HEAD
const uploader = (type = "memoryStorage", filePrefix, folderName) => {
    const storage = multer_1.default.memoryStorage();
=======
const path_1 = __importDefault(require("path"));
const uploader = (type = "memoryStorage", filePrefix, folderName) => {
    const defaultDir = path_1.default.join(__dirname, "../../public");
    const storage = type == "memoryStorage"
        ? multer_1.default.memoryStorage()
        : multer_1.default.diskStorage({
            destination: (req, file, cb) => {
                const destination = folderName
                    ? defaultDir + folderName
                    : defaultDir;
                cb(null, destination);
            },
            filename: (req, file, cb) => {
                // asd.png
                const originalNameParts = file.originalname.split("."); // [asd, png]
                const fileExtension = originalNameParts[originalNameParts.length - 1]; // png
                const newFileName = filePrefix + Date.now() + "." + fileExtension;
                cb(null, newFileName);
            },
        });
>>>>>>> 29015dbb829ec7e191342e3e6ac54a2e823e33b7
=======
const uploader = (type = "memoryStorage", filePrefix, folderName) => {
    const storage = multer_1.default.memoryStorage();
>>>>>>> a07ed01995ea064b936d6edc954f024c4e89bf7c
    return (0, multer_1.default)({ storage });
};
exports.uploader = uploader;
