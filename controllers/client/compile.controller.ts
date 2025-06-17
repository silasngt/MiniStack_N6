import { Request, Response } from 'express';
import { GoogleGenerativeAI } from '@google/generative-ai';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// GET trang compile
export const index = async (req: Request, res: Response) => {
  res.render('client/pages/compile/compile.pug', {
    pageTitle: 'Biên dịch',
    output: null,
  });
};

// POST compile code
export const compileCode = async (req: Request, res: Response) => {
  try {
    const { language, code } = req.body;

    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

    // Prompt gửi đến Gemini
    const prompt = `Hãy biên dịch và chạy đoạn code sau bằng ${language.toUpperCase()}, và trả về kết quả:\n\n${code}`;

    const result = await model.generateContent(prompt);
    const output = result.response.text();

    res.render('client/pages/compile/compile.pug', {
      pageTitle: 'Biên dịch',
      output,
    });
  } catch (error: any) {
    console.error('Lỗi biên dịch với Gemini:', error);
    res.render('client/pages/compile/compile.pug', {
      pageTitle: 'Biên dịch',
      output: 'Lỗi xảy ra khi gọi Gemini API.',
    });
  }
};
