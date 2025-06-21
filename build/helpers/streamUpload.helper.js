"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
var _a, _b, _c;
Object.defineProperty(exports, "__esModule", { value: true });
exports.streamUpload = void 0;
const cloudinary_1 = require("cloudinary");
const streamifier_1 = __importDefault(require("streamifier"));
cloudinary_1.v2.config({
    cloud_name: (_a = process.env.CLOUD_NAME) === null || _a === void 0 ? void 0 : _a.trim(),
    api_key: (_b = process.env.CLOUD_KEY) === null || _b === void 0 ? void 0 : _b.trim(),
    api_secret: (_c = process.env.CLOUD_SECRET) === null || _c === void 0 ? void 0 : _c.trim()
});
const streamUpload = (buffer) => {
    return new Promise((resolve, reject) => {
        let stream = cloudinary_1.v2.uploader.upload_stream({
            resource_type: 'auto',
        }, (error, result) => {
            if (error) {
                reject(error);
            }
            else {
                resolve(result);
            }
        });
        streamifier_1.default.createReadStream(buffer).pipe(stream);
    });
};
exports.streamUpload = streamUpload;
