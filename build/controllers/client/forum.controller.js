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
exports.addComment = exports.exchangeDetail = exports.createQuestion = exports.question = exports.exchangeIndex = exports.index = void 0;
const sequelize_1 = require("sequelize");
const forum_topic_model_1 = __importDefault(require("../../models/forum-topic.model"));
const category_model_1 = __importDefault(require("../../models/category.model"));
const comment_model_1 = __importDefault(require("../../models/comment.model"));
const database_1 = __importDefault(require("../../config/database"));
const index = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const limit = parseInt(req.query.limit) || 5;
        const page = parseInt(req.query.page) || 1;
        const offset = (page - 1) * limit;
        const totalTopics = yield forum_topic_model_1.default.count({
            where: {
                deleted: false,
                status: 'active',
            },
        });
        const totalPages = Math.ceil(totalTopics / limit);
        const topicsWithComments = yield database_1.default.query(`
      SELECT 
        ft.TopicID,
        ft.Title,
        ft.Content,
        ft.CreatedAt,
        u.FullName as AuthorName,
        COUNT(c.CommentID) as CommentCount
      FROM ForumTopic ft
      LEFT JOIN User u ON ft.AuthorID = u.UserID
      LEFT JOIN Comment c ON ft.TopicID = c.TopicID 
        AND c.deleted = false 
        AND c.status = 'active'
      WHERE ft.deleted = false 
        AND ft.status = 'active'
      GROUP BY ft.TopicID, ft.Title, ft.Content, ft.CreatedAt, u.FullName
      ORDER BY ft.CreatedAt DESC
      LIMIT :limit OFFSET :offset
    `, {
            replacements: { limit, offset },
            type: sequelize_1.QueryTypes.SELECT,
        });
        const topics = topicsWithComments;
        res.render('client/pages/forumTopic/index.pug', {
            pageTitle: 'Diễn đàn',
            topics,
            currentPage: page,
            totalPages,
            limit,
        });
    }
    catch (error) {
        console.error('Lỗi khi lấy danh sách câu hỏi:', error);
        res.render('client/pages/forumTopic/index.pug', {
            pageTitle: 'Diễn đàn',
            topics: [],
            currentPage: 1,
            totalPages: 1,
            limit: 10,
            error: 'Không thể tải danh sách câu hỏi.',
        });
    }
});
exports.index = index;
const exchangeIndex = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    res.render('client/pages/forumTopic/forumExchange.pug', {
        pageTitle: 'Diễn đàn trao đổi',
    });
});
exports.exchangeIndex = exchangeIndex;
const question = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const categories = yield category_model_1.default.findAll({
            where: {
                deleted: false,
                status: 'active',
            },
            attributes: ['CategoryID', 'Name', 'Type'],
        });
        const rawCategories = categories.map((cat) => cat.get());
        const forumCategories = rawCategories.filter((cat) => Array.isArray(cat.Type) && cat.Type.includes('Diễn đàn'));
        res.render('client/pages/forumTopic/question.pug', {
            pageTitle: 'Thêm câu hỏi',
            categories: forumCategories,
        });
    }
    catch (error) {
        console.error('Error in question:', error.stack);
        res.render('client/pages/forumTopic/question.pug', {
            pageTitle: 'Thêm câu hỏi',
            categories: [],
            error: 'Không thể tải danh mục, vui lòng thử lại.',
        });
    }
});
exports.question = question;
const createQuestion = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b, _c;
    try {
        const { Title, Content, CategoryID } = req.body;
        if (!Title || !Content || !CategoryID) {
            return res.status(400).render('client/pages/forumTopic/question.pug', {
                pageTitle: 'Thêm câu hỏi',
                error: 'Vui lòng điền đầy đủ các trường bắt buộc.',
                categories: yield category_model_1.default.findAll({
                    where: { deleted: false, status: 'active' },
                    attributes: ['CategoryID', 'Name'],
                }),
            });
        }
        const userId = ((_a = req.user) === null || _a === void 0 ? void 0 : _a.UserID) || ((_c = (_b = req.session) === null || _b === void 0 ? void 0 : _b.user) === null || _c === void 0 ? void 0 : _c.UserID);
        if (!userId) {
            return res.status(401).render('client/pages/forumTopic/question.pug', {
                pageTitle: 'Thêm câu hỏi',
                error: 'Bạn cần đăng nhập để tạo câu hỏi.',
                categories: yield category_model_1.default.findAll({
                    where: { deleted: false, status: 'active' },
                    attributes: ['CategoryID', 'Name'],
                }),
            });
        }
        yield forum_topic_model_1.default.create({
            Title,
            Content,
            AuthorID: userId,
            CategoryID,
            CreatedAt: new Date(),
            deleted: false,
            status: 'active',
        });
        res.redirect('/forum');
    }
    catch (error) {
        console.error(error);
        res.status(500).render('client/pages/forumTopic/question.pug', {
            pageTitle: 'Thêm câu hỏi',
            error: 'Có lỗi xảy ra khi tạo câu hỏi.',
            categories: yield category_model_1.default.findAll({
                where: { deleted: false, status: 'active' },
                attributes: ['CategoryID', 'Name'],
            }),
        });
    }
});
exports.createQuestion = createQuestion;
const exchangeDetail = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const topicId = parseInt(req.params.topicId, 10);
    if (isNaN(topicId)) {
        res.status(400).send('ID topic không hợp lệ');
        return;
    }
    try {
        const topicResults = yield database_1.default.query(`
      SELECT 
        ft.*,
        u.FullName as AuthorName
      FROM ForumTopic ft
      LEFT JOIN User u ON ft.AuthorID = u.UserID
      WHERE ft.TopicID = :topicId
        AND ft.deleted = false 
        AND ft.status = 'active'
    `, {
            replacements: { topicId },
            type: sequelize_1.QueryTypes.SELECT,
        });
        if (!topicResults || topicResults.length === 0) {
            res.status(404).send('Không tìm thấy bài viết');
            return;
        }
        const topic = topicResults[0];
        const comments = yield database_1.default.query(`
      SELECT 
        c.*,
        u.FullName as AuthorName
      FROM Comment c
      LEFT JOIN User u ON c.AuthorID = u.UserID
      WHERE c.TopicID = :topicId
        AND c.deleted = false 
        AND c.status = 'active'
      ORDER BY c.CreatedAt ASC
    `, {
            replacements: { topicId },
            type: sequelize_1.QueryTypes.SELECT,
        });
        res.render('client/pages/forumTopic/forumExchange', {
            topic,
            comments: comments || [],
            pageTitle: topic.Title,
        });
    }
    catch (error) {
        console.error('Lỗi khi lấy dữ liệu topic và bình luận:', error);
        res.status(500).send('Lỗi server');
    }
});
exports.exchangeDetail = exchangeDetail;
const addComment = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b, _c;
    const topicId = parseInt(req.params.topicId, 10);
    const { Content } = req.body;
    if (isNaN(topicId)) {
        res.status(400).send('ID topic không hợp lệ');
        return;
    }
    if (!Content || Content.trim() === '') {
        res.status(400).send('Nội dung bình luận không được để trống');
        return;
    }
    const userId = ((_a = req.user) === null || _a === void 0 ? void 0 : _a.UserID) || ((_c = (_b = req.session) === null || _b === void 0 ? void 0 : _b.user) === null || _c === void 0 ? void 0 : _c.UserID);
    if (!userId) {
        res.status(401).send('Bạn cần đăng nhập để bình luận');
        return;
    }
    try {
        const topicExists = yield forum_topic_model_1.default.findOne({
            where: {
                TopicID: topicId,
                deleted: false,
                status: 'active',
            },
        });
        if (!topicExists) {
            res.status(404).send('Không tìm thấy bài viết');
            return;
        }
        const newComment = yield comment_model_1.default.create({
            Content: Content.trim(),
            CreatedAt: new Date(),
            AuthorID: userId,
            TopicID: topicId,
            deleted: false,
            status: 'active',
        });
        res.redirect(`/forum/exchange/${topicId}`);
    }
    catch (error) {
        console.error('Lỗi khi thêm bình luận:', error);
        res.status(500).send('Lỗi máy chủ');
    }
});
exports.addComment = addComment;
