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
exports.deleteDocument = exports.toggleStatus = exports.update = exports.edit = exports.createPost = exports.create = exports.index = void 0;
const document_model_1 = __importDefault(require("../../models/document.model"));
const category_model_1 = __importDefault(require("../../models/category.model"));
const user_model_1 = __importDefault(require("../../models/user.model"));
const index = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = 5;
        const offset = (page - 1) * limit;
        const totalDocs = yield document_model_1.default.count({
            where: { deleted: false },
        });
        const documents = yield document_model_1.default.findAll({
            where: { deleted: false },
            order: [['DocumentID', 'DESC']],
            limit,
            offset,
        });
        const formattedDocs = yield Promise.all(documents.map((doc) => __awaiter(void 0, void 0, void 0, function* () {
            const document = doc.get({ plain: true });
            const categoryIds = document.Categories || [];
            let categoryNames = [];
            let categoryList = [];
            if (categoryIds.length > 0) {
                const categories = yield category_model_1.default.findAll({
                    where: {
                        CategoryID: categoryIds,
                        deleted: false,
                        status: 'active',
                    },
                    attributes: ['CategoryID', 'Name', 'Type'],
                });
                categoryNames = categories.map((cat) => cat.get('Name'));
                categoryList = categories.map((cat) => ({
                    id: cat.get('CategoryID'),
                    name: cat.get('Name'),
                }));
            }
            let uploaderName = 'N/A';
            if (document.UploadBy) {
                const uploader = yield user_model_1.default.findByPk(document.UploadBy);
                if (uploader) {
                    uploaderName = uploader.get('FullName');
                }
            }
            return {
                id: document.DocumentID,
                title: document.Title,
                categories: categoryList,
                categoryNames: categoryNames.join(', '),
                author: uploaderName,
                createdAt: new Date(document.UploadDate).toLocaleDateString('vi-VN'),
                filePath: document.FilePath,
                status: document.status || 'active',
            };
        })));
        res.render('admin/pages/document/index', {
            pageTitle: 'Danh sách tài liệu',
            documents: formattedDocs,
            pagination: {
                page,
                totalPages: Math.ceil(totalDocs / limit),
                totalItems: totalDocs,
                limit,
            },
        });
    }
    catch (error) {
        console.error('Error:', error);
        res.render('admin/pages/document/index', {
            pageTitle: 'Danh sách tài liệu',
            documents: [],
            error: 'Có lỗi xảy ra khi tải dữ liệu',
        });
    }
});
exports.index = index;
const create = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const categories = yield category_model_1.default.findAll({
            where: {
                status: 'active',
                deleted: false,
            },
            attributes: ['CategoryID', 'Name'],
        });
        res.render('admin/pages/document/create.pug', {
            pageTitle: 'Thêm tài liệu',
            categories: categories,
        });
    }
    catch (error) {
        res.status(500).json({
            success: false,
            message: 'Có lỗi xảy ra khi lấy danh mục',
            error: error.message,
        });
    }
});
exports.create = create;
const createPost = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { title, category, link, description } = req.body;
        const categories = Array.isArray(category) ? category : [category];
        if (!title || !category) {
            res.status(400).json({
                success: false,
                message: 'Thiếu thông tin bắt buộc'
            });
            return;
        }
        const newDocument = yield document_model_1.default.create({
            Title: title,
            Description: description || '',
            FilePath: link || '',
            UploadDate: new Date(),
            UploadBy: req.session.adminUser.id,
            Categories: categories,
            status: 'active',
            Thumbnail: req.body.thumbnail || null
        });
        res.redirect('/admin/document');
    }
    catch (error) {
        console.error('Lỗi:', error);
        res.status(500).json({
            success: false,
            message: 'Có lỗi xảy ra khi thêm tài liệu'
        });
    }
});
exports.createPost = createPost;
const edit = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { id } = req.params;
        const document = yield document_model_1.default.findOne({
            where: { DocumentID: id, deleted: false },
        });
        if (!document) {
            res.render('admin/error', {
                message: 'Không tìm thấy tài liệu',
            });
            return;
        }
        const categories = yield category_model_1.default.findAll({
            where: { deleted: false, status: 'active' },
        });
        const documentData = document.get({ plain: true });
        res.render('admin/pages/document/edit', {
            pageTitle: 'Sửa tài liệu',
            document: documentData,
            categories,
        });
    }
    catch (error) {
        console.error('Error:', error);
        res.render('admin/error', {
            message: 'Có lỗi xảy ra',
        });
    }
});
exports.edit = edit;
const update = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { id } = req.params;
        const { title, category, link, currentThumbnail } = req.body;
        const document = yield document_model_1.default.findOne({
            where: {
                DocumentID: id,
                deleted: false
            }
        });
        if (!document) {
            res.status(404).json({
                success: false,
                message: 'Không tìm thấy tài liệu'
            });
            return;
        }
        const currentDoc = document.get({ plain: true });
        let categories = [];
        if (Array.isArray(category)) {
            categories = category;
        }
        else if (category) {
            categories = [category];
        }
        else {
            categories = currentDoc.Categories || [];
        }
        let thumbnailPath = currentDoc.Thumbnail;
        if (req.file) {
            thumbnailPath = req.file.path;
        }
        else if (currentThumbnail && currentThumbnail !== currentDoc.Thumbnail) {
            thumbnailPath = currentThumbnail;
        }
        const updateData = {
            Title: title || currentDoc.Title,
            Categories: categories,
            FilePath: link || currentDoc.FilePath,
            Thumbnail: req.body.thumbnail
        };
        yield document.update(updateData);
        res.redirect('/admin/document');
    }
    catch (error) {
        console.error('Update error:', error);
        res.status(500).json({
            success: false,
            message: 'Có lỗi xảy ra khi cập nhật tài liệu',
            error: error.message
        });
    }
});
exports.update = update;
const toggleStatus = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { id } = req.params;
        const document = yield document_model_1.default.findOne({
            where: { DocumentID: id, deleted: false },
        });
        if (!document) {
            res.status(404).json({ success: false, message: 'Không tìm thấy user' });
            return;
        }
        const currentStatus = document.get('status');
        const newStatus = currentStatus === 'active' ? 'inactive' : 'active';
        yield document.update({ status: newStatus });
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
const deleteDocument = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { id } = req.params;
        if (!id) {
            res
                .status(400)
                .json({ success: false, message: 'ID người dùng không hợp lệ' });
            return;
        }
        const document = yield document_model_1.default.findOne({
            where: {
                DocumentID: id,
                deleted: false,
            },
        });
        if (!document) {
            res
                .status(404)
                .json({ success: false, message: 'Không tìm thấy người dùng' });
            return;
        }
        yield document.update({
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
exports.deleteDocument = deleteDocument;
