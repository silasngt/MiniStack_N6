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
Object.defineProperty(exports, "__esModule", { value: true });
exports.compileCode = exports.index = void 0;
const generative_ai_1 = require("@google/generative-ai");
const genAI = new generative_ai_1.GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const index = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    res.render('client/pages/compile/compile.pug', {
        pageTitle: 'Biên dịch',
        output: null,
    });
});
exports.index = index;
const compileCode = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { language, code } = req.body;
        const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
        const prompt = `Hãy biên dịch và chạy đoạn code sau bằng ${language.toUpperCase()}, và trả về kết quả:\n\n${code}`;
        const result = yield model.generateContent(prompt);
        const output = result.response.text();
        res.render('client/pages/compile/compile.pug', {
            pageTitle: 'Biên dịch',
            output,
        });
    }
    catch (error) {
        console.error('Lỗi biên dịch với Gemini:', error);
        res.render('client/pages/compile/compile.pug', {
            pageTitle: 'Biên dịch',
            output: 'Lỗi xảy ra khi gọi Gemini API.',
        });
    }
});
exports.compileCode = compileCode;
