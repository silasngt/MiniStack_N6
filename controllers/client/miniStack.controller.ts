import { Request, Response } from 'express';
import User from '../../models/user.model';

export const index = async (req: Request, res: Response) => {
  res.render('client/pages/stack/index.pug', {
    pageTitle: 'MiniStack',
    isHomePage: true,
  });
};
