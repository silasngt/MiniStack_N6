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
exports.toggleStatus = exports.deleteCategory = exports.edit = exports.editForm = exports.add = exports.addForm = exports.index = void 0;
const category_model_1 = __importDefault(require("../../models/category.model"));
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
        const totalCategories = yield category_model_1.default.count({
            where: {
                deleted: false,
            },
        });
        const totalPages = Math.ceil(totalCategories / limit);
        const categories = yield category_model_1.default.findAll({
            where: { deleted: false },
            order: [['CategoryID', 'ASC']],
            limit: limit,
            offset: skip,
        });
        res.render('admin/pages/categories/index.pug', {
            pageTitle: 'Quản lý danh mục',
            categories,
            currentPage: page,
            totalPages: totalPages,
            skip,
        });
    }
    catch (error) {
        console.error('Lỗi khi lấy danh sách categories:', error);
        res.status(500).send('Lỗi server');
    }
});
exports.index = index;
const addForm = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    res.render('admin/pages/categories/add.pug', {
        pageTitle: 'Thêm danh mục mới',
    });
});
exports.addForm = addForm;
const add = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { name, type, status } = req.body;
        const types = Array.isArray(type) ? type : [type];
        if (!name || !types.length) {
            res.status(400).send('Tên và loại danh mục là bắt buộc');
            return;
        }
        yield category_model_1.default.create({
            Name: name.trim(),
            Type: types,
            status: status || 'active',
            deleted: false,
        });
        res.redirect('/admin/categories');
    }
    catch (error) {
        console.error('Lỗi khi thêm danh mục:', error);
        res.status(500).send('Lỗi khi thêm danh mục: ' + error.message);
    }
});
exports.add = add;
const editForm = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { id } = req.params;
        if (!id) {
            res.status(400).send('ID danh mục không hợp lệ');
            return;
        }
        const category = yield category_model_1.default.findOne({
            where: {
                CategoryID: id,
                deleted: false,
            },
        });
        if (!category) {
            res.status(404).send('Không tìm thấy danh mục');
            return;
        }
        const cat = category.get({ plain: true });
        const categoryData = {
            _id: cat.CategoryID,
            name: cat.Name,
            type: cat.Type,
            status: cat.status || 'active',
        };
        res.render('admin/pages/categories/edit.pug', {
            pageTitle: 'Chỉnh sửa danh mục',
            category: categoryData,
        });
    }
    catch (error) {
        console.error('Lỗi khi lấy thông tin danh mục:', error);
        res.status(500).send('Lỗi server');
    }
});
exports.editForm = editForm;
const edit = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { id } = req.params;
        const { name, type, status } = req.body;
        if (!id) {
            res.status(400).send('ID danh mục không hợp lệ');
            return;
        }
        const types = Array.isArray(type) ? type : [type];
        if (!name || !types.length) {
            res.status(400).send('Tên và loại danh mục là bắt buộc');
            return;
        }
        const category = yield category_model_1.default.findOne({
            where: {
                CategoryID: id,
                deleted: false,
            },
        });
        if (!category) {
            res.status(404).send('Không tìm thấy danh mục');
            return;
        }
        yield category.update({
            Name: name.trim(),
            Type: types,
            status: status || 'active',
        });
        res.redirect('/admin/categories');
    }
    catch (error) {
        console.error('Lỗi khi cập nhật danh mục:', error);
        res
            .status(500)
            .send('Lỗi khi cập nhật danh mục: ' + error.message);
    }
});
exports.edit = edit;
const deleteCategory = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { id } = req.params;
        if (!id) {
            res
                .status(400)
                .json({ success: false, message: 'ID danh mục không hợp lệ' });
            return;
        }
        const category = yield category_model_1.default.findOne({
            where: {
                CategoryID: id,
                deleted: false,
            },
        });
        if (!category) {
            res
                .status(404)
                .json({ success: false, message: 'Không tìm thấy danh mục' });
            return;
        }
        yield category.update({
            deleted: true,
            deletedAt: new Date(),
        });
        res.json({ success: true, message: 'Xóa danh mục thành công' });
    }
    catch (error) {
        console.error('Lỗi khi xóa danh mục:', error);
        res.status(500).json({ success: false, message: 'Lỗi server' });
    }
});
exports.deleteCategory = deleteCategory;
const toggleStatus = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { id } = req.params;
        if (!id) {
            res
                .status(400)
                .json({ success: false, message: 'ID danh mục không hợp lệ' });
            return;
        }
        const category = yield category_model_1.default.findOne({
            where: {
                CategoryID: id,
                deleted: false,
            },
        });
        if (!category) {
            res
                .status(404)
                .json({ success: false, message: 'Không tìm thấy danh mục' });
            return;
        }
        const currentStatus = category.get('status');
        const newStatus = currentStatus === 'active' ? 'inactive' : 'active';
        yield category.update({ status: newStatus });
        res.json({
            success: true,
            newStatus: newStatus,
            message: `Đã ${newStatus === 'active' ? 'kích hoạt' : 'vô hiệu hóa'} danh mục`,
        });
    }
    catch (error) {
        console.error('Lỗi khi chuyển đổi trạng thái danh mục:', error);
        res.status(500).json({ success: false, message: 'Lỗi server' });
    }
});
exports.toggleStatus = toggleStatus;
