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
exports.logout = exports.login = exports.index = void 0;
const user_model_1 = __importDefault(require("../../models/user.model"));
const md5_1 = __importDefault(require("md5"));
const index = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    res.render('admin/pages/auth/login.pug', {
        pageTitle: 'Đăng nhập admin',
        errorMessage: null,
    });
});
exports.index = index;
const login = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { email, password } = req.body;
    const user = yield user_model_1.default.findOne({
        where: { Email: email, Role: 'Admin', deleted: false },
    });
    const userPassword = user ? user.get('Password') : null;
    if (!user || userPassword !== (0, md5_1.default)(password)) {
        return res.render('admin/pages/auth/login.pug', {
            pageTitle: 'Đăng nhập admin',
            errorMessage: 'Sai tài khoản hoặc mật khẩu!',
        });
    }
    const userData = user.get({ plain: true });
    const adminUser = yield user_model_1.default.findOne({ where: { Email: req.body.email } });
    if (adminUser) {
        const userData = adminUser.get({ plain: true });
        req.session.adminUser = {
            id: userData.UserID,
            name: userData.FullName,
            avatar: userData.Avatar,
            email: userData.Email,
        };
        res.redirect('/admin/dashboard');
    }
});
exports.login = login;
const logout = (req, res) => {
    req.session.destroy(() => {
        res.redirect('/admin/auth/login');
    });
};
exports.logout = logout;
