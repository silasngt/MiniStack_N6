import { Request, Response } from 'express';

export const index = async (req: Request, res: Response) => {
  res.render('admin/pages/user/index.pug', {
    pageTitle: 'Quản lý người dùng',
  });
};
