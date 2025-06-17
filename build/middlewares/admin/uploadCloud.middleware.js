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
Object.defineProperty(exports, "__esModule", { value: true });
exports.uploadFields = exports.uploadSingle = void 0;
const streamUpload_helper_1 = require("../../helpers/streamUpload.helper");
const uploadSingle = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    if (req['file']) {
        try {
            const result = yield (0, streamUpload_helper_1.streamUpload)(req['file'].buffer);
            req.body[req['file'].fieldname] = result['url'];
            next();
        }
        catch (error) {
            console.error("Upload error:", error);
            res.status(500).json({
                error: "Error uploading file"
            });
        }
    }
    else {
        next();
    }
});
exports.uploadSingle = uploadSingle;
const uploadFields = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    for (const key in req['files']) {
        req.body[key] = [];
        const array = req['files'][key];
        for (const item of array) {
            try {
                const result = yield (0, streamUpload_helper_1.streamUpload)(item.buffer);
                req.body[key].push(result['url']);
            }
            catch (error) {
                console.log(error);
            }
        }
    }
    next();
});
exports.uploadFields = uploadFields;
