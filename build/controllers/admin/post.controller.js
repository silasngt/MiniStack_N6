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
exports.deletePost = exports.editPost = exports.edit = exports.createPost = exports.create = exports.toggleStatus = exports.index = void 0;
const category_model_1 = __importDefault(require("../../models/category.model"));
const post_model_1 = __importDefault(require("../../models/post.model"));
const user_model_1 = __importDefault(require("../../models/user.model"));
const getCurrentUser = (req) => {
    var _a;
    const adminUser = (_a = req.session) === null || _a === void 0 ? void 0 : _a.adminUser;
    return adminUser
        ? { id: adminUser.id, role: adminUser.role || 'Admin' }
        : null;
};
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
        const totalPosts = yield post_model_1.default.count({
            where: {
                deleted: false,
            },
        });
        const totalPages = Math.ceil(totalPosts / limit);
        const posts = yield post_model_1.default.findAll({
            where: { deleted: false },
            offset: skip,
            limit: limit,
            order: [['CreatedAt', 'DESC']],
        });
        const postsWithCategories = yield Promise.all(posts.map((post) => __awaiter(void 0, void 0, void 0, function* () {
            const postData = post.toJSON();
            const categoryIds = postData.Categories || [];
            let categoryNames = [];
            if (categoryIds.length > 0) {
                const categories = yield category_model_1.default.findAll({
                    where: {
                        CategoryID: categoryIds,
                        deleted: false,
                    },
                });
                categoryNames = categories.map((cat) => cat.get('Name'));
            }
            let authorName = 'Chưa xác định';
            if (postData.AuthorID) {
                const author = yield user_model_1.default.findByPk(postData.AuthorID);
                if (author) {
                    authorName = author.get('FullName');
                }
            }
            return Object.assign(Object.assign({}, postData), { categoryNames: categoryNames.join(', '), authorName: authorName, formattedDate: new Date(postData.CreatedAt).toLocaleDateString('vi-VN'), hasImage: !!postData.Image, status: postData.status || 'active' });
        })));
        res.render('admin/pages/post/index.pug', {
            pageTitle: 'Quản lý bài viết',
            posts: postsWithCategories,
            success: req.query.success,
            currentPage: page,
            totalPages: totalPages,
        });
        return;
    }
    catch (error) {
        res.render('admin/pages/post/index.pug', {
            pageTitle: 'Quản lý bài viết',
            posts: [],
        });
        return;
    }
});
exports.index = index;
const toggleStatus = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const currentUser = getCurrentUser(req);
        if (!currentUser) {
            res.status(401).json({
                success: false,
                message: 'Vui lòng đăng nhập lại!',
            });
            return;
        }
        const postId = parseInt(req.params.id);
        const existingPost = yield post_model_1.default.findByPk(postId);
        if (!existingPost || existingPost.get('deleted')) {
            res.status(404).json({
                success: false,
                message: 'Không tìm thấy bài viết!',
            });
            return;
        }
        const currentStatus = existingPost.get('status');
        const newStatus = currentStatus === 'active' ? 'inactive' : 'active';
        yield existingPost.update({
            status: newStatus,
        });
        res.status(200).json({
            success: true,
            message: `Bài viết đã được ${newStatus === 'active' ? 'kích hoạt' : 'tạm dừng'}!`,
            data: {
                postId: postId,
                status: newStatus,
                isActive: newStatus === 'active',
            },
        });
        return;
    }
    catch (error) {
        res.status(500).json({
            success: false,
            message: 'Có lỗi xảy ra khi thay đổi trạng thái bài viết!',
        });
        return;
    }
});
exports.toggleStatus = toggleStatus;
const create = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const currentUser = getCurrentUser(req);
        if (!currentUser) {
            res.redirect('/admin/auth/login');
            return;
        }
        const categories = yield category_model_1.default.findAll({
            where: {
                deleted: false,
                status: 'active',
            },
        });
        const postCategories = categories.filter((category) => {
            const types = category.get('Type');
            return types && types.includes('Bài viết');
        });
        res.render('admin/pages/post/create', {
            pageTitle: 'Thêm bài viết mới',
            categories: postCategories,
        });
        return;
    }
    catch (error) {
        res.redirect('/admin/posts');
        return;
    }
});
exports.create = create;
const createPost = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const currentUser = getCurrentUser(req);
        if (!currentUser) {
            res.status(401).json({
                success: false,
                message: 'Vui lòng đăng nhập lại!',
            });
            return;
        }
        const { title, content, category } = req.body;
        if (!title || !content) {
            res.status(400).json({
                success: false,
                message: 'Vui lòng điền đầy đủ thông tin bắt buộc!',
            });
            return;
        }
        let categoryIds = [];
        if (Array.isArray(category)) {
            categoryIds = category.map((id) => parseInt(id));
        }
        else if (category) {
            categoryIds = [parseInt(category)];
        }
        if (categoryIds.length > 0) {
            const validCategories = yield category_model_1.default.findAll({
                where: {
                    CategoryID: categoryIds,
                    deleted: false,
                    status: 'active',
                },
            });
            const invalidCategories = validCategories.filter((cat) => {
                const types = cat.get('Type');
                return !types || !types.includes('Bài viết');
            });
            if (invalidCategories.length > 0) {
                res.status(400).json({
                    success: false,
                    message: 'Một số danh mục không hợp lệ cho bài viết!',
                });
                return;
            }
            if (validCategories.length !== categoryIds.length) {
                res.status(400).json({
                    success: false,
                    message: 'Một số danh mục không tồn tại!',
                });
                return;
            }
        }
        const imageUrl = req.body.image || null;
        const newPost = yield post_model_1.default.create({
            Title: title,
            Content: content,
            AuthorID: currentUser.id,
            Categories: categoryIds,
            Image: imageUrl,
            CreatedAt: new Date(),
            deleted: false,
            status: 'active',
        });
        res.redirect('/admin/posts?success=created');
        return;
    }
    catch (error) {
        console.error('❌ Error creating post:', error);
        res.status(500).json({
            success: false,
            message: 'Có lỗi xảy ra khi tạo bài viết!',
        });
        return;
    }
});
exports.createPost = createPost;
const edit = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const currentUser = getCurrentUser(req);
        if (!currentUser) {
            res.redirect('/admin/auth/login');
            return;
        }
        const postId = parseInt(req.params.id);
        const post = yield post_model_1.default.findByPk(postId);
        if (!post || post.get('deleted')) {
            res.status(404).render('admin/pages/404', {
                pageTitle: 'Không tìm thấy bài viết',
            });
            return;
        }
        const categories = yield category_model_1.default.findAll({
            where: {
                deleted: false,
                status: 'active',
            },
        });
        const postCategories = categories.filter((category) => {
            const types = category.get('Type');
            return types && types.includes('Bài viết');
        });
        res.render('admin/pages/post/edit', {
            pageTitle: 'Chỉnh sửa bài viết',
            post: post.toJSON(),
            categories: postCategories,
        });
        return;
    }
    catch (error) {
        console.error('Error loading edit page:', error);
        res.redirect('/admin/posts');
        return;
    }
});
exports.edit = edit;
const editPost = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const currentUser = getCurrentUser(req);
        if (!currentUser) {
            res.status(401).json({
                success: false,
                message: 'Vui lòng đăng nhập lại!',
            });
            return;
        }
        const postId = parseInt(req.params.id);
        const { title, content, category, currentImage } = req.body;
        if (!title || !content) {
            res.status(400).json({
                success: false,
                message: 'Vui lòng điền đầy đủ thông tin bắt buộc!',
            });
            return;
        }
        const existingPost = yield post_model_1.default.findByPk(postId);
        if (!existingPost || existingPost.get('deleted')) {
            res.status(404).json({
                success: false,
                message: 'Không tìm thấy bài viết!',
            });
            return;
        }
        let categoryIds = [];
        if (Array.isArray(category)) {
            categoryIds = category.map((id) => parseInt(id));
        }
        else if (category) {
            categoryIds = [parseInt(category)];
        }
        if (categoryIds.length > 0) {
            const validCategories = yield category_model_1.default.findAll({
                where: {
                    CategoryID: categoryIds,
                    deleted: false,
                    status: 'active',
                },
            });
            const invalidCategories = validCategories.filter((cat) => {
                const types = cat.get('Type');
                return !types || !types.includes('Bài viết');
            });
            if (invalidCategories.length > 0) {
                res.status(400).json({
                    success: false,
                    message: 'Một số danh mục không hợp lệ cho bài viết!',
                });
                return;
            }
            if (validCategories.length !== categoryIds.length) {
                res.status(400).json({
                    success: false,
                    message: 'Một số danh mục không tồn tại!',
                });
                return;
            }
        }
        let finalImageUrl = null;
        if (req.body.image) {
            finalImageUrl = req.body.image;
        }
        else if (currentImage) {
            finalImageUrl = currentImage;
        }
        yield existingPost.update({
            Title: title,
            Content: content,
            Categories: categoryIds,
            Image: finalImageUrl,
        });
        res.redirect(`/admin/posts?success=updated&id=${postId}`);
        return;
    }
    catch (error) {
        console.error('❌ Error updating post:', error);
        res.status(500).json({
            success: false,
            message: 'Có lỗi xảy ra khi cập nhật bài viết!',
        });
        return;
    }
});
exports.editPost = editPost;
const deletePost = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const currentUser = getCurrentUser(req);
        if (!currentUser) {
            res.status(401).json({
                success: false,
                message: 'Vui lòng đăng nhập lại!',
            });
            return;
        }
        const postId = parseInt(req.params.id);
        const existingPost = yield post_model_1.default.findByPk(postId);
        if (!existingPost || existingPost.get('deleted')) {
            res.status(404).json({
                success: false,
                message: 'Không tìm thấy bài viết!',
            });
            return;
        }
        yield existingPost.update({
            deleted: true,
        });
        res.status(200).json({
            success: true,
            message: 'Xóa bài viết thành công!',
        });
        return;
    }
    catch (error) {
        console.error('❌ Error deleting post:', error);
        res.status(500).json({
            success: false,
            message: 'Có lỗi xảy ra khi xóa bài viết!',
        });
        return;
    }
});
exports.deletePost = deletePost;
