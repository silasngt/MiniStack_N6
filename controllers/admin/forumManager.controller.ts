import { Request, Response } from 'express';

export const index = async (req: Request, res: Response) => {
  res.render('admin/pages/forumManager/forumManager.pug', {
    pageTitle: 'Quản lý diễn đàn',
  });
};