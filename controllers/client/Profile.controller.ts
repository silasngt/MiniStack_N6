import { Request, Response } from 'express';

export const index = async (req: Request, res: Response) => {
  res.render('client/pages/Profile/index.pug', {
    pageTitle: 'Cài đặt',
  });
};
export const history = async (req: Request, res: Response) => {
  res.render('client/pages/Profile/history.pug', {
    pageTitle: 'Lịch sử ',
  });
};
