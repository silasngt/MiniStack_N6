import { Request, Response } from 'express';
import { GoogleGenerativeAI } from '@google/generative-ai';

// Khởi tạo Google Generative AI với API key từ biến môi trường
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');

// Hàm làm sạch văn bản Markdown
function cleanMarkdown(text: string): string {
  return text
    .replace(/\*\*(.*?)\*\*/g, '$1') // Loại bỏ **in đậm**
    .replace(/\*(.*?)\*/g, '$1') // Loại bỏ *nghiêng*
    .replace(/```[\s\S]*?```/g, (match) => match.replace(/```/g, '')) // Loại bỏ code block
    .replace(/`([^`]+)`/g, '$1') // Loại bỏ inline code
    .replace(/\n+/g, ' ') // Thay nhiều xuống dòng bằng dấu cách
    .replace(/[#*-]+/g, '') // Loại bỏ ký tự Markdown như #, *, -
    .trim(); // Xóa khoảng trắng thừa
}

// Hiển thị trang chat
export const index = async (req: Request, res: Response): Promise<void> => {
  res.render('client/pages/chatBox/chatBox.pug', {
    pageTitle: 'Chat AI',
  });
};

// Xử lý yêu cầu chat API
export const chatAPI = async (req: Request, res: Response): Promise<void> => {
  try {
    if (!process.env.GEMINI_API_KEY) {
      throw new Error('GEMINI_API_KEY không được cấu hình');
    }

    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
    const result = await model.generateContent(req.body.message);
    let reply = result.response.text();

    // Làm sạch văn bản Markdown
    reply = cleanMarkdown(reply);

    res.json({ reply });
  } catch (err) {
    console.error('Gemini error:', err);
    res.status(500).json({ reply: 'Lỗi xảy ra' });
  }
};

// Log API key (chỉ dùng trong môi trường dev)
console.log('GEMINI_API_KEY:', process.env.GEMINI_API_KEY ? 'Đã cấu hình' : 'Chưa cấu hình');