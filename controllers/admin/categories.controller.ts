import { Request, Response } from 'express';

export const index = async (req: Request, res: Response) => {
  res.render('admin/pages/categories/index.pug', {
    pageTitle: 'Quản lý danh mục',
  });
};
