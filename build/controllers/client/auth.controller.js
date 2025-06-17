"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
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
exports.changePassword = exports.updateProfile = exports.getProfile = exports.logout = exports.loginPost = exports.registerPost = exports.register = exports.login = void 0;
const md5_1 = __importDefault(require("md5"));
const jwt = __importStar(require("jsonwebtoken"));
const user_model_1 = __importDefault(require("../../models/user.model"));
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';
const login = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    res.render('client/pages/auth/login.pug', {
        pageTitle: 'Đăng nhập',
    });
});
exports.login = login;
const register = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    res.render('client/pages/auth/register.pug', {
        pageTitle: 'Đăng ký',
    });
});
exports.register = register;
const validateEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
};
const validatePhone = (phone) => {
    const phoneDigits = phone.replace(/\D/g, '');
    return phoneDigits.length === 10;
};
const validatePassword = (password) => {
    return password.length >= 6;
};
const registerPost = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        if (!req.body || Object.keys(req.body).length === 0) {
            console.error('Request body is empty or undefined');
            return res.status(400).json({
                success: false,
                message: 'Dữ liệu không được gửi từ form. Vui lòng kiểm tra lại.',
                debug: {
                    bodyExists: !!req.body,
                    bodyType: typeof req.body,
                    contentType: req.headers['content-type'],
                },
            });
        }
        const { email, fullname, phone, gender, password, confirmPassword } = req.body;
        const requiredFields = {
            email,
            fullname,
            phone,
            gender,
            password,
            confirmPassword,
        };
        const missingFields = Object.entries(requiredFields)
            .filter(([key, value]) => !value || (typeof value === 'string' && value.trim() === ''))
            .map(([key]) => key);
        if (missingFields.length > 0) {
            return res.status(400).json({
                success: false,
                message: 'Vui lòng điền đầy đủ thông tin',
                missingFields: missingFields,
            });
        }
        const validationErrors = [];
        if (!validateEmail(email)) {
            validationErrors.push('Email không hợp lệ');
        }
        if (fullname.trim().length < 2) {
            validationErrors.push('Tên phải có ít nhất 2 ký tự');
        }
        if (!validatePhone(phone)) {
            validationErrors.push('Số điện thoại không hợp lệ');
        }
        if (!['Nam', 'Nữ', 'Khác'].includes(gender)) {
            validationErrors.push('Giới tính không hợp lệ');
        }
        if (!validatePassword(password)) {
            validationErrors.push('Mật khẩu phải có ít nhất 6 ký tự');
        }
        if (password !== confirmPassword) {
            validationErrors.push('Mật khẩu xác nhận không khớp');
        }
        if (validationErrors.length > 0) {
            return res.status(400).json({
                success: false,
                message: validationErrors.join(', '),
                validationErrors,
            });
        }
        const existingUser = yield user_model_1.default.findOne({
            where: {
                Email: email.toLowerCase().trim(),
            },
        });
        if (existingUser) {
            return res.status(400).json({
                success: false,
                message: 'Email đã được sử dụng',
            });
        }
        const hashedPassword = (0, md5_1.default)(password);
        const phoneDigits = phone.replace(/\D/g, '');
        const newUserInstance = yield user_model_1.default.create({
            FullName: fullname.trim(),
            Email: email.toLowerCase().trim(),
            Phone: phoneDigits,
            Password: hashedPassword,
            Gender: gender,
            Role: 'User',
            deleted: false,
            status: 'active',
        });
        const newUser = newUserInstance.get({ plain: true });
        const token = jwt.sign({
            userId: newUser.UserID,
            email: newUser.Email,
            role: newUser.Role,
        }, JWT_SECRET, { expiresIn: '24h' });
        const userResponse = {
            UserID: newUser.UserID,
            FullName: newUser.FullName,
            Email: newUser.Email,
            Phone: newUser.Phone,
            Gender: newUser.Gender,
            Role: newUser.Role,
            status: newUser.status,
            token: token,
        };
        res.status(201).json({
            success: true,
            message: 'Đăng ký thành công',
            user: userResponse,
        });
    }
    catch (error) {
        console.error('Signup error details:', {
            message: error.message,
            stack: error.stack,
            name: error.name,
        });
        if (error.name === 'SequelizeValidationError') {
            return res.status(400).json({
                success: false,
                message: 'Dữ liệu không hợp lệ: ' +
                    error.errors.map((e) => e.message).join(', '),
            });
        }
        if (error.name === 'SequelizeUniqueConstraintError') {
            return res.status(400).json({
                success: false,
                message: 'Email hoặc số điện thoại đã được sử dụng',
            });
        }
        res.status(500).json({
            success: false,
            message: 'Có lỗi xảy ra trong quá trình đăng ký',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined,
        });
    }
});
exports.registerPost = registerPost;
const loginPost = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { username, password, rememberMe } = req.body;
        if (!username || !password) {
            return res.render('client/pages/auth/login.pug', {
                pageTitle: 'Đăng nhập',
                error: 'Vui lòng nhập tên người dùng và mật khẩu',
            });
        }
        if (!validateEmail(username)) {
            return res.render('client/pages/auth/login.pug', {
                pageTitle: 'Đăng nhập',
                error: 'Email không hợp lệ',
            });
        }
        const userInstance = yield user_model_1.default.findOne({
            where: {
                Email: username.toLowerCase().trim(),
            },
        });
        if (!userInstance) {
            return res.render('client/pages/auth/login.pug', {
                pageTitle: 'Đăng nhập',
                error: 'Tên người dùng hoặc mật khẩu không đúng',
            });
        }
        const user = userInstance.get({ plain: true });
        if (user.deleted || user.status !== 'active') {
            return res.render('client/pages/auth/login.pug', {
                pageTitle: 'Đăng nhập',
                error: 'Tài khoản không khả dụng',
            });
        }
        const hashedInputPassword = (0, md5_1.default)(password);
        if (hashedInputPassword !== user.Password) {
            return res.render('client/pages/auth/login.pug', {
                pageTitle: 'Đăng nhập',
                error: 'Tên người dùng hoặc mật khẩu không đúng',
            });
        }
        const tokenExpiry = rememberMe ? '30d' : '24h';
        const token = jwt.sign({
            userId: user.UserID,
            email: user.Email,
            role: user.Role,
        }, JWT_SECRET, { expiresIn: tokenExpiry });
        const cookieMaxAge = rememberMe
            ? 30 * 24 * 60 * 60 * 1000
            : 24 * 60 * 60 * 1000;
        res.cookie('auth_token', token, {
            maxAge: cookieMaxAge,
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'lax',
            path: '/',
        });
        return res.redirect('/');
    }
    catch (error) {
        console.error('Login error:', error);
        return res.render('client/pages/auth/login.pug', {
            pageTitle: 'Đăng nhập',
            error: 'Có lỗi xảy ra khi đăng nhập',
        });
    }
});
exports.loginPost = loginPost;
const logout = (req, res) => {
    res.clearCookie('auth_token', { path: '/' });
    req.session.destroy(() => {
        res.redirect('/');
    });
};
exports.logout = logout;
const getProfile = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { id } = req.params;
        if (!id || isNaN(Number(id))) {
            return res.status(400).json({
                success: false,
                message: 'ID người dùng không hợp lệ',
            });
        }
        const user = yield user_model_1.default.findOne({
            where: {
                UserID: id,
                deleted: false,
            },
            attributes: { exclude: ['Password'] },
        });
        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'Không tìm thấy người dùng',
            });
        }
        res.status(200).json({
            success: true,
            user: user,
        });
    }
    catch (error) {
        console.error('Get profile error:', error);
        res.status(500).json({
            success: false,
            message: 'Có lỗi xảy ra khi lấy thông tin người dùng',
        });
    }
});
exports.getProfile = getProfile;
const updateProfile = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { id } = req.params;
        const { fullname, gender, avatar } = req.body;
        if (!id || isNaN(Number(id))) {
            return res.status(400).json({
                success: false,
                message: 'ID người dùng không hợp lệ',
            });
        }
        const user = yield user_model_1.default.findOne({
            where: {
                UserID: id,
                deleted: false,
            },
        });
        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'Không tìm thấy người dùng',
            });
        }
        const updateData = {};
        if (fullname !== undefined) {
            if (fullname.trim().length < 2) {
                return res.status(400).json({
                    success: false,
                    message: 'Tên phải có ít nhất 2 ký tự',
                });
            }
            updateData.FullName = fullname.trim();
        }
        if (gender !== undefined) {
            if (!['Nam', 'Nữ', 'Khác'].includes(gender)) {
                return res.status(400).json({
                    success: false,
                    message: 'Giới tính không hợp lệ',
                });
            }
            updateData.Gender = gender;
        }
        if (avatar !== undefined) {
            updateData.Avatar = avatar;
        }
        yield user.update(updateData);
        const updatedUser = yield user_model_1.default.findByPk(id, {
            attributes: { exclude: ['Password'] },
        });
        res.status(200).json({
            success: true,
            message: 'Cập nhật thông tin thành công',
            user: updatedUser,
        });
    }
    catch (error) {
        console.error('Update profile error:', error);
        res.status(500).json({
            success: false,
            message: 'Có lỗi xảy ra khi cập nhật thông tin',
        });
    }
});
exports.updateProfile = updateProfile;
const changePassword = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { id } = req.params;
        const { currentPassword, newPassword, confirmNewPassword } = req.body;
        if (!id || isNaN(Number(id))) {
            return res.status(400).json({
                success: false,
                message: 'ID người dùng không hợp lệ',
            });
        }
        if (!currentPassword || !newPassword || !confirmNewPassword) {
            return res.status(400).json({
                success: false,
                message: 'Vui lòng điền đầy đủ thông tin',
            });
        }
        if (newPassword !== confirmNewPassword) {
            return res.status(400).json({
                success: false,
                message: 'Mật khẩu mới và xác nhận mật khẩu không khớp',
            });
        }
        if (!validatePassword(newPassword)) {
            return res.status(400).json({
                success: false,
                message: 'Mật khẩu mới phải có ít nhất 6 ký tự',
            });
        }
        const user = yield user_model_1.default.findOne({
            where: {
                UserID: id,
                deleted: false,
            },
        });
        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'Không tìm thấy người dùng',
            });
        }
        const userPlain = user.get({ plain: true });
        const hashedCurrentPassword = (0, md5_1.default)(currentPassword);
        if (hashedCurrentPassword !== userPlain.Password) {
            return res.status(400).json({
                success: false,
                message: 'Mật khẩu hiện tại không đúng',
            });
        }
        const hashedNewPassword = (0, md5_1.default)(newPassword);
        yield user.update({
            Password: hashedNewPassword,
        });
        res.status(200).json({
            success: true,
            message: 'Đổi mật khẩu thành công',
        });
    }
    catch (error) {
        console.error('Change password error:', error);
        res.status(500).json({
            success: false,
            message: 'Có lỗi xảy ra khi đổi mật khẩu',
        });
    }
});
exports.changePassword = changePassword;
exports.default = {
    login: exports.login,
    register: exports.register,
    registerPost: exports.registerPost,
    loginPost: exports.loginPost,
    logout: exports.logout,
    getProfile: exports.getProfile,
    updateProfile: exports.updateProfile,
    changePassword: exports.changePassword,
};
