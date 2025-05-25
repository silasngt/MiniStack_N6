import { Request, Response } from 'express';

export const login = async (req: Request, res: Response) => {
  res.render('client/pages/auth/login.pug', {
    pageTitle: 'Đăng nhập',
  });
};
export const register = async (req: Request, res: Response) => {
  res.render('client/pages/auth/register.pug', {
    pageTitle: 'Đăng ký',
  });
};
