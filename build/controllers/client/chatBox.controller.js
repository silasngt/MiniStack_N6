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
exports.chatAPI = exports.index = void 0;
const generative_ai_1 = require("@google/generative-ai");
const genAI = new generative_ai_1.GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');
function cleanMarkdown(text) {
    return text
        .replace(/\*\*(.*?)\*\*/g, '$1')
        .replace(/\*(.*?)\*/g, '$1')
        .replace(/```[\s\S]*?```/g, (match) => match.replace(/```/g, ''))
        .replace(/`([^`]+)`/g, '$1')
        .replace(/\n+/g, ' ')
        .replace(/[#*-]+/g, '')
        .trim();
}
const index = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    res.render('client/pages/chatBox/chatBox.pug', {
        pageTitle: 'Chat AI',
    });
});
exports.index = index;
const chatAPI = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        if (!process.env.GEMINI_API_KEY) {
            throw new Error('GEMINI_API_KEY không được cấu hình');
        }
        const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
        const result = yield model.generateContent(req.body.message);
        let reply = result.response.text();
        reply = cleanMarkdown(reply);
        res.json({ reply });
    }
    catch (err) {
        console.error('Gemini error:', err);
        res.status(500).json({ reply: 'Lỗi xảy ra' });
    }
});
exports.chatAPI = chatAPI;
console.log('GEMINI_API_KEY:', process.env.GEMINI_API_KEY ? 'Đã cấu hình' : 'Chưa cấu hình');
