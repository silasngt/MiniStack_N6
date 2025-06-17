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
exports.toggleStatus = exports.deleteUser = exports.update = exports.edit = exports.create = exports.add = exports.index = void 0;
const user_model_1 = __importDefault(require("../../models/user.model"));
const md5_1 = __importDefault(require("md5"));
const index = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        let limit = 4;
        let page = 1;
        if (req.query.limit) {
            limit = parseInt(`${req.query.limit}`);
        }
        if (req.query.page) {
            page = parseInt(`${req.query.page}`);
        }
        const skip = (page - 1) * limit;
        const totalUsers = yield user_model_1.default.count({
            where: {
                deleted: false,
            },
        });
        const totalPages = Math.ceil(totalUsers / limit);
        const usersFromDB = yield user_model_1.default.findAll({
            where: { deleted: false },
            order: [['UserID', 'ASC']],
            attributes: { exclude: ['Password'] },
            limit: limit,
            offset: skip,
        });
        const users = usersFromDB.map((user, index) => {
            const userData = user.get({ plain: true });
            return {
                stt: skip + index + 1,
                id: userData.UserID,
                name: userData.FullName,
                email: userData.Email,
                phone: userData.Phone || '',
                date: userData.createdAt
                    ? new Date(userData.createdAt).toLocaleDateString('vi-VN')
                    : 'N/A',
                role: userData.Role ? userData.Role.toLowerCase() : 'user',
                status: userData.status || 'active',
            };
        });
        res.render('admin/pages/user/index.pug', {
            pageTitle: 'Quản lý người dùng',
            users,
            currentPage: page,
            totalPages: totalPages,
        });
    }
    catch (error) {
        console.error('Error fetching users:', error);
        res.render('admin/pages/user/index.pug', {
            pageTitle: 'Quản lý người dùng',
            users: [],
            currentPage: 1,
            totalPages: 1,
        });
    }
});
exports.index = index;
const add = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        res.render('admin/pages/user/add.pug', {
            pageTitle: 'Thêm người dùng mới',
        });
    }
    catch (error) {
        console.error('Error rendering add user form:', error);
        res.status(500).send('Lỗi khi hiển thị form thêm người dùng');
    }
});
exports.add = add;
const create = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { fullName, email, password, confirmPassword, phone, gender, role, status, } = req.body;
        if (!fullName || !email || !password || !confirmPassword) {
            res.render('admin/pages/user/add.pug', {
                pageTitle: 'Thêm người dùng mới',
                errorMessage: 'Vui lòng điền đầy đủ các trường bắt buộc',
                formData: { fullName, email, phone, gender, role, status },
            });
            return;
        }
        if (password !== confirmPassword) {
            res.render('admin/pages/user/add.pug', {
                pageTitle: 'Thêm người dùng mới',
                errorMessage: 'Mật khẩu xác nhận không khớp',
                formData: { fullName, email, phone, gender, role, status },
            });
            return;
        }
        if (password.length < 6) {
            res.render('admin/pages/user/add.pug', {
                pageTitle: 'Thêm người dùng mới',
                errorMessage: 'Mật khẩu phải có ít nhất 6 ký tự',
                formData: { fullName, email, phone, gender, role, status },
            });
            return;
        }
        if (phone && phone.trim() !== '') {
            const phoneRegex = /^\d{10}$/;
            if (!phoneRegex.test(phone.trim())) {
                res.render('admin/pages/user/add.pug', {
                    pageTitle: 'Thêm người dùng mới',
                    errorMessage: 'Số điện thoại phải có đúng 10 chữ số',
                    formData: { fullName, email, phone, gender, role, status },
                });
                return;
            }
        }
        const existingUser = yield user_model_1.default.findOne({
            where: { Email: email.trim().toLowerCase(), deleted: false },
        });
        if (existingUser) {
            res.render('admin/pages/user/add.pug', {
                pageTitle: 'Thêm người dùng mới',
                errorMessage: 'Email này đã được sử dụng',
                formData: { fullName, email, phone, gender, role, status },
            });
            return;
        }
        const hashedPassword = (0, md5_1.default)(password);
        const userData = {
            FullName: fullName.trim(),
            Email: email.trim().toLowerCase(),
            Password: hashedPassword,
            Role: role === 'admin' ? 'Admin' : 'User',
            status: status || 'active',
            deleted: false,
            createdAt: new Date(),
        };
        if (phone && phone.trim() !== '') {
            userData.Phone = phone.trim();
        }
        if (gender && ['Nam', 'Nữ', 'Khác'].includes(gender)) {
            userData.Gender = gender;
        }
        const newUser = yield user_model_1.default.create(userData);
        res.redirect('/admin/user?success=Thêm người dùng thành công');
    }
    catch (error) {
        console.error('Error creating user:', error);
        console.error('Error details:', error.message);
        console.error('Error stack:', error.stack);
        if (error.name === 'SequelizeUniqueConstraintError') {
            res.render('admin/pages/user/add.pug', {
                pageTitle: 'Thêm người dùng mới',
                errorMessage: 'Email này đã được sử dụng',
                formData: req.body,
            });
            return;
        }
        if (error.name === 'SequelizeValidationError') {
            const validationErrors = error.errors
                .map((err) => err.message)
                .join(', ');
            res.render('admin/pages/user/add.pug', {
                pageTitle: 'Thêm người dùng mới',
                errorMessage: `Lỗi validation: ${validationErrors}`,
                formData: req.body,
            });
            return;
        }
        if (error.name === 'SequelizeConnectionError') {
            res.render('admin/pages/user/add.pug', {
                pageTitle: 'Thêm người dùng mới',
                errorMessage: 'Lỗi kết nối database. Vui lòng thử lại.',
                formData: req.body,
            });
            return;
        }
        res.render('admin/pages/user/add.pug', {
            pageTitle: 'Thêm người dùng mới',
            errorMessage: 'Có lỗi xảy ra khi tạo người dùng. Vui lòng thử lại.',
            formData: req.body,
        });
    }
});
exports.create = create;
const edit = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const userId = req.params.id;
        const userFromDB = yield user_model_1.default.findByPk(userId);
        if (!userFromDB) {
            res.status(404).send('User not found');
            return;
        }
        const userData = userFromDB.get({ plain: true });
        const user = {
            id: userData.UserID,
            name: userData.FullName,
            email: userData.Email,
            phone: userData.Phone || '',
            gender: userData.Gender,
            role: userData.Role ? userData.Role.toLowerCase() : 'user',
            status: userData.status,
        };
        res.render('admin/pages/user/edit.pug', { user });
    }
    catch (error) {
        res.status(500).send('Lỗi khi lấy thông tin người dùng');
    }
});
exports.edit = edit;
const update = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { id, name, email, phone, gender, role, status, newPassword } = req.body;
        const user = yield user_model_1.default.findByPk(id);
        if (!user) {
            res.status(404).send('User not found');
            return;
        }
        const updateData = {
            FullName: name,
            Email: email,
            Role: role === 'admin' ? 'Admin' : 'User',
            status: status,
        };
        if (phone && phone.trim() !== '') {
            const phoneRegex = /^\d{10}$/;
            if (!phoneRegex.test(phone.trim())) {
                res.status(400).send('Số điện thoại phải có đúng 10 chữ số');
                return;
            }
            updateData.Phone = phone.trim();
        }
        else {
            updateData.Phone = null;
        }
        if (gender && ['Nam', 'Nữ', 'Khác'].includes(gender)) {
            updateData.Gender = gender;
        }
        if (newPassword && newPassword.trim() !== '') {
            if (newPassword.length < 6) {
                res.status(400).send('Mật khẩu phải có ít nhất 6 ký tự');
                return;
            }
            const hashedPassword = (0, md5_1.default)(newPassword);
            updateData.Password = hashedPassword;
        }
        yield user.update(updateData);
        res.redirect('/admin/user');
    }
    catch (error) {
        console.error('Error updating user:', error);
        res.status(500).send('Lỗi khi cập nhật người dùng');
    }
});
exports.update = update;
const deleteUser = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { id } = req.params;
        if (!id) {
            res
                .status(400)
                .json({ success: false, message: 'ID người dùng không hợp lệ' });
            return;
        }
        const user = yield user_model_1.default.findOne({
            where: {
                UserID: id,
                deleted: false,
            },
        });
        if (!user) {
            res
                .status(404)
                .json({ success: false, message: 'Không tìm thấy người dùng' });
            return;
        }
        yield user.update({
            deleted: true,
            deletedAt: new Date(),
        });
        res.json({ success: true, message: 'Xóa người dùng thành công' });
    }
    catch (error) {
        console.error('Lỗi khi xóa người dùng:', error);
        res.status(500).json({ success: false, message: 'Lỗi server' });
    }
});
exports.deleteUser = deleteUser;
const toggleStatus = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { id } = req.params;
        const user = yield user_model_1.default.findOne({
            where: { UserID: id, deleted: false },
        });
        if (!user) {
            res.status(404).json({ success: false, message: 'Không tìm thấy user' });
            return;
        }
        const currentStatus = user.get('status');
        const newStatus = currentStatus === 'active' ? 'inactive' : 'active';
        yield user.update({ status: newStatus });
        res.json({
            success: true,
            newStatus,
            message: `Đã ${newStatus === 'active' ? 'kích hoạt' : 'vô hiệu hóa'} user`,
        });
    }
    catch (error) {
        console.error('Error toggling user status:', error);
        res.status(500).json({ success: false, message: 'Lỗi server' });
    }
});
exports.toggleStatus = toggleStatus;
