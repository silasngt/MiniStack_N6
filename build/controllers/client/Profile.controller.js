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
exports.editPasswordPatch = exports.editPatch = exports.history = exports.index = void 0;
const user_model_1 = __importDefault(require("../../models/user.model"));
const md5_1 = __importDefault(require("md5"));
const forum_topic_model_1 = __importDefault(require("../../models/forum-topic.model"));
const index = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const userId = req.params.id;
    const infoUser = yield user_model_1.default.findOne({
        where: {
            UserID: userId,
            deleted: false,
            status: 'active',
        },
        raw: true,
    });
    res.render('client/pages/profile/index.pug', {
        pageTitle: 'Cài đặt',
    });
});
exports.index = index;
const history = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const userId = req.params.id;
    const infoHistory = yield forum_topic_model_1.default.findAll({
        where: {
            AuthorID: userId,
            deleted: false,
            status: 'active',
        },
        raw: true,
    });
    const totalInfoHistory = yield forum_topic_model_1.default.count({
        where: {
            AuthorID: userId,
            deleted: false,
            status: 'active',
        },
    });
    res.render('client/pages/profile/history.pug', {
        pageTitle: 'Lịch sử ',
        infoHistory: infoHistory,
        totalInfoHistory: totalInfoHistory,
    });
});
exports.history = history;
const editPatch = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const userId = req.params.id;
    yield user_model_1.default.update({
        FullName: req.body.FullName,
        Phone: req.body.Phone,
    }, {
        where: {
            UserID: userId,
            deleted: false,
            status: 'active',
        },
    });
    res.redirect(`/profile/${userId}`);
});
exports.editPatch = editPatch;
const editPasswordPatch = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const userId = req.params.id;
    if (!req.body.CurrentPassword) {
        req.flash('error', 'Vui lòng nhập mật khẩu hiện tại');
        return res.redirect(`/profile/${userId}`);
    }
    const userPassword = yield user_model_1.default.findOne({
        where: {
            UserID: userId,
            deleted: false,
            status: 'active',
        },
        raw: true,
    });
    if (!userPassword ||
        userPassword['Password'] !== (0, md5_1.default)(req.body.CurrentPassword)) {
        req.flash('error', 'Mật khẩu cũ không đúng');
        return res.redirect(`/profile/${userId}`);
    }
    yield user_model_1.default.update({
        Password: (0, md5_1.default)(req.body.NewPassword),
    }, {
        where: {
            UserID: userId,
            deleted: false,
            status: 'active',
        },
    });
    req.flash('success', 'Đổi mật khẩu thành công');
    res.redirect(`/profile/${userId}`);
});
exports.editPasswordPatch = editPasswordPatch;
