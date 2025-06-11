import { Request, Response } from 'express';
import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

export const index = async (req: Request, res: Response) => {
  res.render('client/pages/chatBox/chatBox.pug', {
    pageTitle: 'Chat AI',
  });
};

export const chatAPI = async (req: Request, res: Response) => {
  try {
    // Đổi từ "gemini-pro" thành "gemini-1.5-flash"
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
    const result = await model.generateContent(req.body.message);
    const reply = result.response.text();
    res.json({ reply });
  } catch (err) {
    console.error('Gemini error:', err);
    res.status(500).json({ reply: 'Lỗi xảy ra' });
  }
};
console.log('GEMINI_API_KEY:', process.env.GEMINI_API_KEY);
