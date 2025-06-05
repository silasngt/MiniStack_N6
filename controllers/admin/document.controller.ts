import { Request, Response } from 'express';

export const index = async (req: Request, res: Response) => {
  res.render('admin/pages/document/document.pug', {
    pageTitle: 'Quản lý tài liệu',
  });
  
};
export const addDocument = async (req: Request, res: Response) => {
res.render('admin/pages/document/addDocument.pug', {
    pageTitle: 'Thêm tài liệu',
  });
}