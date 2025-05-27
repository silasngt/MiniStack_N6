import { Request, Response } from 'express';

export const index = async (req: Request, res: Response) => {
  res.render('admin/pages/addDocument/addDocument.pug', {
    pageTitle: 'Thêm tài liệu',
  });
};
