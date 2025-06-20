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
exports.uploadAvatar = exports.changePassword = exports.updateBasicInfo = exports.index = void 0;
const user_model_1 = __importDefault(require("../../models/user.model"));
const md5_1 = __importDefault(require("md5"));
const getCurrentUserId = (req) => {
    var _a;
    const adminUser = (_a = req.session) === null || _a === void 0 ? void 0 : _a.adminUser;
    return (adminUser === null || adminUser === void 0 ? void 0 : adminUser.id) || null;
};
const index = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const currentUserId = getCurrentUserId(req);
        if (!currentUserId) {
            res.redirect('/admin/auth/login');
            return;
        }
        const currentUser = yield user_model_1.default.findByPk(currentUserId);
        if (!currentUser || currentUser.get('deleted')) {
            res.status(404).render('admin/pages/404', {
                pageTitle: 'Không tìm thấy thông tin người dùng',
            });
            return;
        }
        const userData = currentUser.toJSON();
        const profileData = {
            userID: userData.UserID,
            fullName: userData.FullName || 'Chưa cập nhật',
            email: userData.Email || '',
            avatar: userData.Avatar ||
                'https://e7.pngegg.com/pngimages/349/288/png-clipart-teacher-education-student-course-school-avatar-child-face.png',
            gender: userData.Gender || 'Chưa cập nhật',
            role: userData.Role || 'User',
            status: userData.status || 'active',
            phone: userData.Phone || '',
        };
        res.render('admin/pages/profile/index.pug', {
            pageTitle: 'Thông tin cá nhân',
            profile: profileData,
        });
        return;
    }
    catch (error) {
        res.status(500).render('admin/pages/500', {
            pageTitle: 'Lỗi hệ thống',
        });
        return;
    }
});
exports.index = index;
const updateBasicInfo = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const currentUserId = getCurrentUserId(req);
        if (!currentUserId) {
            res.status(401).json({
                success: false,
                message: 'Vui lòng đăng nhập lại!',
            });
            return;
        }
        const { fullName, gender, phone } = req.body;
        if (!fullName || fullName.trim().length === 0) {
            res.status(400).json({
                success: false,
                message: 'Họ và tên không được để trống!',
            });
            return;
        }
        if (phone && phone.trim().length > 0) {
            const phoneRegex = /^[\+]?[0-9\-\s\(\)]{8,20}$/;
            if (!phoneRegex.test(phone.trim())) {
                res.status(400).json({
                    success: false,
                    message: 'Số điện thoại không hợp lệ!',
                });
                return;
            }
        }
        const currentUser = yield user_model_1.default.findByPk(currentUserId);
        if (!currentUser || currentUser.get('deleted')) {
            res.status(404).json({
                success: false,
                message: 'Không tìm thấy thông tin người dùng!',
            });
            return;
        }
        yield currentUser.update({
            FullName: fullName.trim(),
            Gender: gender || null,
            Phone: phone ? phone.trim() : null,
        });
        const adminUser = req.session.adminUser;
        if (adminUser) {
            adminUser.name = fullName.trim();
            req.session.adminUser = adminUser;
        }
        res.json({
            success: true,
            message: 'Cập nhật thông tin thành công!',
            data: {
                fullName: fullName.trim(),
                gender: gender,
                phone: (phone === null || phone === void 0 ? void 0 : phone.trim()) || '',
            },
        });
        return;
    }
    catch (error) {
        res.status(500).json({
            success: false,
            message: 'Có lỗi xảy ra khi cập nhật thông tin!',
        });
        return;
    }
});
exports.updateBasicInfo = updateBasicInfo;
const changePassword = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const currentUserId = getCurrentUserId(req);
        if (!currentUserId) {
            res.status(401).json({
                success: false,
                message: 'Vui lòng đăng nhập lại!',
            });
            return;
        }
        const { currentPassword, newPassword, confirmPassword } = req.body;
        if (!currentPassword || !newPassword || !confirmPassword) {
            res.status(400).json({
                success: false,
                message: 'Vui lòng điền đầy đủ thông tin!',
                missingFields: {
                    currentPassword: !currentPassword,
                    newPassword: !newPassword,
                    confirmPassword: !confirmPassword,
                },
            });
            return;
        }
        if (newPassword !== confirmPassword) {
            res.status(400).json({
                success: false,
                message: 'Mật khẩu mới và xác nhận mật khẩu không khớp!',
            });
            return;
        }
        if (newPassword.length < 6) {
            res.status(400).json({
                success: false,
                message: 'Mật khẩu mới phải có ít nhất 6 ký tự!',
            });
            return;
        }
        const currentPasswordMD5 = (0, md5_1.default)(currentPassword);
        const newPasswordMD5 = (0, md5_1.default)(newPassword);
        if (currentPasswordMD5 === newPasswordMD5) {
            res.status(400).json({
                success: false,
                message: 'Mật khẩu mới phải khác mật khẩu hiện tại!',
            });
            return;
        }
        const currentUser = yield user_model_1.default.findByPk(currentUserId);
        if (!currentUser || currentUser.get('deleted')) {
            res.status(404).json({
                success: false,
                message: 'Không tìm thấy thông tin người dùng!',
            });
            return;
        }
        const storedPassword = currentUser.get('Password');
        if (storedPassword !== currentPasswordMD5) {
            res.status(400).json({
                success: false,
                message: 'Mật khẩu hiện tại không chính xác!',
                code: 'INVALID_CURRENT_PASSWORD',
            });
            return;
        }
        yield currentUser.update({
            Password: newPasswordMD5,
        });
        res.json({
            success: true,
            message: 'Đổi mật khẩu thành công!',
        });
        return;
    }
    catch (error) {
        res.status(500).json({
            success: false,
            message: 'Có lỗi xảy ra khi đổi mật khẩu!',
        });
        return;
    }
});
exports.changePassword = changePassword;
const uploadAvatar = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const currentUserId = getCurrentUserId(req);
        if (!currentUserId) {
            res.status(401).json({
                success: false,
                message: 'Vui lòng đăng nhập lại!',
            });
            return;
        }
        const avatarUrl = req.body.avatar;
        if (!avatarUrl) {
            res.status(400).json({
                success: false,
                message: 'Không tìm thấy file ảnh!',
            });
            return;
        }
        const currentUser = yield user_model_1.default.findByPk(currentUserId);
        if (!currentUser || currentUser.get('deleted')) {
            res.status(404).json({
                success: false,
                message: 'Không tìm thấy thông tin người dùng!',
            });
            return;
        }
        yield currentUser.update({
            Avatar: avatarUrl,
        });
        const adminUser = req.session.adminUser;
        if (adminUser) {
            adminUser.Avatar = avatarUrl;
            req.session.adminUser = adminUser;
        }
        res.json({
            success: true,
            message: 'Cập nhật ảnh đại diện thành công!',
            data: {
                avatarUrl: avatarUrl,
            },
        });
        return;
    }
    catch (error) {
        res.status(500).json({
            success: false,
            message: 'Có lỗi xảy ra khi tải ảnh lên!',
        });
        return;
    }
});
exports.uploadAvatar = uploadAvatar;
