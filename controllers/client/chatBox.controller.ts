import { Request, Response } from 'express';

export const index = async (req: Request, res: Response) => {
  res.render('client/pages/chatBox/chatBox.pug', {
    pageTitle: 'Chat AI',
  });
};
