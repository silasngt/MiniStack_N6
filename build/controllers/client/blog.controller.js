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
exports.detailBlog = exports.index = void 0;
const post_model_1 = __importDefault(require("../../models/post.model"));
const category_model_1 = __importDefault(require("../../models/category.model"));
const user_model_1 = __importDefault(require("../../models/user.model"));
const moment_1 = __importDefault(require("moment"));
const index = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        let limit = 6;
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
                status: 'active',
            },
        });
        const totalPages = Math.ceil(totalPosts / limit);
        const posts = yield post_model_1.default.findAll({
            where: {
                deleted: false,
                status: 'active',
            },
            raw: true,
            offset: skip,
            limit: limit,
        });
        const postsWithDetails = yield Promise.all(posts.map((post) => __awaiter(void 0, void 0, void 0, function* () {
            let categoryIds = [];
            try {
                categoryIds =
                    typeof post['Categories'] === 'string'
                        ? JSON.parse(post['Categories'])
                        : [];
            }
            catch (error) {
                console.error(` ${post['PostID']}:`, error);
            }
            const categories = yield category_model_1.default.findAll({
                where: {
                    CategoryID: categoryIds,
                    deleted: false,
                    status: 'active',
                },
                attributes: ['CategoryID', 'Name'],
                raw: true,
            });
            const author = yield user_model_1.default.findOne({
                where: {
                    UserID: post['AuthorID'],
                    deleted: false,
                    status: 'active',
                },
                attributes: ['FullName'],
                raw: true,
            });
            return Object.assign(Object.assign({}, post), { CategoryNames: categories.map((cat) => cat['Name']), AuthorName: author ? author['FullName'] : 'Unknown', FormattedCreatedAt: (0, moment_1.default)(post['createdAt']).format('DD MMMM YYYY') });
        })));
        res.render('client/pages/blog/index.pug', {
            pageTitle: 'Bài viết',
            posts: postsWithDetails,
            currentPage: page,
            totalPages: totalPages,
        });
    }
    catch (error) {
        console.error('Error in blog controller:', error);
        res.status(500).send('Internal Server Error');
    }
});
exports.index = index;
const detailBlog = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const postId = req.params.id;
    const post = yield post_model_1.default.findOne({
        where: {
            PostID: postId,
            deleted: false,
            status: 'active',
        },
        raw: true,
    });
    const AuthorName = yield user_model_1.default.findOne({
        where: {
            UserID: post['AuthorID'],
            deleted: false,
            status: 'active',
        },
        attributes: ['FullName'],
        raw: true,
    });
    const postFormatted = Object.assign(Object.assign({}, post), { AuthorName: AuthorName ? AuthorName['FullName'] : 'Unknown', FormattedCreatedAt: (0, moment_1.default)(post['createdAt']).format('DD MMMM YYYY') });
    res.render('client/pages/blog/detail.pug', {
        pageTitle: post['Title'],
        blog: postFormatted,
    });
});
exports.detailBlog = detailBlog;
