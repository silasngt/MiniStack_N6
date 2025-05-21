import { Request, Response } from 'express';

export const index = async (req: Request, res: Response) => {
  res.render('client/pages/blog/index.pug', {
    pageTitle: 'Bài viết',
  });
};
