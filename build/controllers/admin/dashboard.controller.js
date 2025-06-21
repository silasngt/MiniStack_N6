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
exports.index = void 0;
const forum_topic_model_1 = __importDefault(require("../../models/forum-topic.model"));
const user_model_1 = __importDefault(require("../../models/user.model"));
const post_model_1 = __importDefault(require("../../models/post.model"));
const document_model_1 = __importDefault(require("../../models/document.model"));
const index = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const totalForumTopics = yield forum_topic_model_1.default.count({
        where: {
            deleted: false,
            status: 'active',
        },
    });
    const totalUsers = yield user_model_1.default.count({
        where: {
            deleted: false,
            status: 'active',
            role: 'user',
        },
    });
    const totalPost = yield post_model_1.default.count({
        where: {
            deleted: false,
            status: 'active',
        },
    });
    const totalDocument = yield document_model_1.default.count({
        where: {
            deleted: false,
            status: 'active',
        },
    });
    res.render('admin/pages/dashboard/index.pug', {
        pageTitle: 'Dashboard',
        totalForumTopics: totalForumTopics,
        totalUsers: totalUsers,
        totalPost: totalPost,
        totalDocument: totalDocument,
    });
});
exports.index = index;
