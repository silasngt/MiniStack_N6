import { Request, Response } from 'express';

export const index = async (req: Request, res: Response) => {
  res.render('admin/pages/post/index.pug', {
    pageTitle: 'Quản lý bài viết',
  });
};

export const create = async (req: Request, res: Response) => {
  res.render('admin/pages/post/create.pug', {
    pageTitle: 'Thêm bài viết',
  });
};
