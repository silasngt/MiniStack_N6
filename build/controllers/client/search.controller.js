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
exports.searchSuggestions = exports.search = void 0;
const sequelize_1 = require("sequelize");
const forum_topic_model_1 = __importDefault(require("../../models/forum-topic.model"));
const comment_model_1 = __importDefault(require("../../models/comment.model"));
const truncateContent = (content, maxLength) => {
    if (!content)
        return '';
    const cleanContent = content.replace(/<[^>]*>/g, '');
    if (cleanContent.length <= maxLength) {
        return cleanContent;
    }
    return cleanContent.substring(0, maxLength).trim() + '...';
};
const search = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const searchQuery = req.query.q || '';
        const page = parseInt(req.query.page || '1', 10);
        const limit = 10;
        const offset = (page - 1) * limit;
        if (!searchQuery.trim()) {
            res.render('client/pages/search/index', {
                pageTitle: 'Tìm kiếm',
                searchQuery: '',
                searchResults: [],
                currentPage: 1,
                totalPages: 0,
                totalResults: 0,
            });
            return;
        }
        const whereCondition = {
            [sequelize_1.Op.and]: [
                {
                    [sequelize_1.Op.or]: [
                        {
                            Title: {
                                [sequelize_1.Op.like]: `%${searchQuery}%`,
                            },
                        },
                        {
                            Content: {
                                [sequelize_1.Op.like]: `%${searchQuery}%`,
                            },
                        },
                    ],
                },
                {
                    deleted: false,
                },
                {
                    status: 'active',
                },
            ],
        };
        const { count, rows: forumTopics } = yield forum_topic_model_1.default.findAndCountAll({
            where: whereCondition,
            attributes: ['TopicID', 'Title', 'Content'],
            order: [['CreatedAt', 'DESC']],
            limit: limit,
            offset: offset,
            distinct: true,
        });
        const searchResults = yield Promise.all(forumTopics.map((topic) => __awaiter(void 0, void 0, void 0, function* () {
            const topicData = topic.toJSON();
            const commentCount = yield comment_model_1.default.count({
                where: {
                    TopicID: topicData.TopicID,
                    deleted: false,
                    status: 'active',
                },
            });
            return {
                id: topicData.TopicID,
                title: topicData.Title,
                content: truncateContent(topicData.Content, 150),
                answers: commentCount,
            };
        })));
        const totalResults = count;
        const totalPages = Math.ceil(totalResults / limit);
        res.render('client/pages/search/index', {
            pageTitle: `Kết quả tìm kiếm: ${searchQuery}`,
            searchQuery,
            searchResults,
            currentPage: page,
            totalPages,
            totalResults,
        });
    }
    catch (error) {
        console.error('Error searching:', error);
        res.status(500).render('client/pages/error/500', {
            pageTitle: 'Lỗi máy chủ',
            error: 'Có lỗi xảy ra khi tìm kiếm. Vui lòng thử lại sau.',
        });
    }
});
exports.search = search;
const searchSuggestions = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const query = req.query.q || '';
        if (!query.trim() || query.length < 2) {
            res.json({ suggestions: [] });
            return;
        }
        const suggestions = yield forum_topic_model_1.default.findAll({
            where: {
                Title: {
                    [sequelize_1.Op.like]: `%${query}%`,
                },
                deleted: false,
                status: 'active',
            },
            attributes: ['TopicID', 'Title'],
            limit: 5,
            order: [['CreatedAt', 'DESC']],
        });
        const formattedSuggestions = suggestions.map((topic) => ({
            id: topic.TopicID,
            title: topic.Title,
        }));
        res.json({ suggestions: formattedSuggestions });
    }
    catch (error) {
        console.error('❌ Error getting search suggestions:', error);
        res.json({ suggestions: [] });
    }
});
exports.searchSuggestions = searchSuggestions;
exports.default = { search, searchSuggestions };
