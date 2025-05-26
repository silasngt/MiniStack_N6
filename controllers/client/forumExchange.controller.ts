import { Request, Response } from 'express';

export const index = async (req: Request, res: Response) => {
  res.render('client/pages/forumExchange/forumExchange.pug', {
    pageTitle: 'Diễn đàn trao đổi',
  });
};