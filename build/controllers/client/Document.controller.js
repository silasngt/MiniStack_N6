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
exports.index = void 0;
const document_model_1 = __importDefault(require("../../models/document.model"));
const category_model_1 = __importDefault(require("../../models/category.model"));
const index = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = 5;
        const offset = (page - 1) * limit;
        const documents = yield document_model_1.default.findAll({
            where: {
                status: 'active',
                deleted: false
            },
            order: [['UploadDate', 'DESC']],
            limit,
            offset
        });
        const formattedDocs = yield Promise.all(documents.map((doc) => __awaiter(void 0, void 0, void 0, function* () {
            const document = doc.get({ plain: true });
            const categoryIds = document.Categories || [];
            const categories = yield category_model_1.default.findAll({
                where: {
                    CategoryID: categoryIds,
                    status: 'active'
                },
                attributes: ['CategoryID', 'Name']
            });
            return {
                id: document.DocumentID,
                title: document.Title,
                thumbnail: document.Thumbnail,
                filePath: document.FilePath,
                categories: categories
            };
        })));
        const totalDocs = yield document_model_1.default.count({
            where: {
                status: 'active',
                deleted: false
            }
        });
        res.render('client/pages/document/index', {
            pageTitle: 'Thư viện tài liệu',
            documents: formattedDocs,
            pagination: {
                page,
                totalPages: Math.ceil(totalDocs / limit),
                hasNext: page * limit < totalDocs,
                hasPrev: page > 1
            }
        });
    }
    catch (error) {
        console.error('Error:', error);
        res.render('client/pages/document/index', {
            pageTitle: 'Thư viện tài liệu',
            error: 'Có lỗi xảy ra khi tải dữ liệu'
        });
    }
});
exports.index = index;
