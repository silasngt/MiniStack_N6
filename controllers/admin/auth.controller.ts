import { Request, Response } from 'express';

export const index = async (req: Request, res: Response) => {
  res.render('admin/pages/auth/index.pug', {
    pageTitle: 'Đăng nhập admin',
  });
};
