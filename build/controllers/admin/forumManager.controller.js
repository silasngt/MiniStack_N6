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
exports.deleteTopic = exports.updateTitle = exports.updateStatus = exports.index = void 0;
const sequelize_1 = require("sequelize");
const index_model_1 = require("../../models/index.model");
const database_1 = __importDefault(require("../../config/database"));
const index = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const limit = parseInt(req.query.limit) || 5;
        const page = parseInt(req.query.page) || 1;
        const offset = (page - 1) * limit;
        const totalTopics = yield database_1.default.query(`
      SELECT COUNT(*) as total
      FROM ForumTopic ft
      LEFT JOIN User u ON ft.AuthorID = u.UserID
      WHERE ft.deleted = false 
        AND u.deleted = false 
        AND u.status = 'active'
    `, {
            type: sequelize_1.QueryTypes.SELECT
        });
        const totalCount = totalTopics[0].total;
        const totalPages = Math.ceil(totalCount / limit);
        const topicsWithComments = yield database_1.default.query(`
      SELECT 
        ft.TopicID,
        ft.Title,
        ft.Content,
        ft.CreatedAt,
        ft.status,
        u.FullName,
        u.Email,
        COUNT(c.CommentID) as CommentCount
      FROM ForumTopic ft
      LEFT JOIN User u ON ft.AuthorID = u.UserID
      LEFT JOIN Comment c ON ft.TopicID = c.TopicID 
        AND c.deleted = false 
        AND c.status = 'active'
      WHERE ft.deleted = false 
        AND u.deleted = false 
        AND u.status = 'active'
      GROUP BY ft.TopicID, ft.Title, ft.Content, ft.CreatedAt, ft.status, u.FullName, u.Email
      ORDER BY ft.CreatedAt DESC
      LIMIT :limit OFFSET :offset
    `, {
            replacements: { limit, offset },
            type: sequelize_1.QueryTypes.SELECT
        });
        const formattedTopics = topicsWithComments.map((topic) => ({
            id: topic.TopicID,
            content: topic.Title,
            name: topic.FullName || 'N/A',
            email: topic.Email || 'N/A',
            date: topic.CreatedAt
                ? new Date(topic.CreatedAt).toLocaleDateString('vi-VN')
                : '',
            status: topic.status,
            commentCount: parseInt(topic.CommentCount) || 0,
        }));
        res.render('admin/pages/forumManager/forumManager.pug', {
            pageTitle: 'Quản lý diễn đàn',
            questions: formattedTopics,
            currentPage: page,
            totalPages,
            limit,
        });
    }
    catch (err) {
        console.error('Error in admin forum index:', err);
        res.render('admin/pages/forumManager/forumManager.pug', {
            pageTitle: 'Quản lý diễn đàn',
            questions: [],
            currentPage: 1,
            totalPages: 1,
            limit: 10,
            error: 'Không thể tải danh sách diễn đàn.',
        });
    }
});
exports.index = index;
const updateStatus = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { id } = req.params;
    const { status } = req.body;
    try {
        yield index_model_1.ForumTopic.update({ status }, { where: { TopicID: id } });
        res.sendStatus(200);
    }
    catch (err) {
        res.status(500).send('Error updating status');
    }
});
exports.updateStatus = updateStatus;
const updateTitle = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { id } = req.params;
    const { Title } = req.body;
    try {
        yield index_model_1.ForumTopic.update({ Title }, { where: { TopicID: id } });
        res.sendStatus(200);
    }
    catch (err) {
        res.status(500).send('Error updating title');
    }
});
exports.updateTitle = updateTitle;
const deleteTopic = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { id } = req.params;
    try {
        yield index_model_1.ForumTopic.update({ deleted: true }, { where: { TopicID: id } });
        res.sendStatus(200);
    }
    catch (err) {
        res.status(500).send('Error deleting topic');
    }
});
exports.deleteTopic = deleteTopic;
