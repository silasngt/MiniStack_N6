import { Request, Response } from 'express';

export const index = async (req: Request, res: Response) => {
  res.render('client/pages/Document/index.pug', {
    pageTitle: 'Tài liệu',
  });
};
