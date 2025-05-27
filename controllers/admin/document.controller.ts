import { Request, Response } from 'express';

export const index = async (req: Request, res: Response) => {
  res.render('admin/pages/document/document.pug', {
    pageTitle: 'Quản lý tài liệu',
  });
};
