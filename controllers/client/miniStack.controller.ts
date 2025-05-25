import { Request, Response } from 'express';
import User from '../../models/user.model';

export const index = async (req: Request, res: Response) => {
  // const user = await User.findAll({
  //   where: {
  //     userid: 1,
  //   },
  //   raw: true, //Giữ lại các trường dữ liệu chuẩn như trong db
  // });
  res.render('client/pages/stack/index.pug', {
    pageTitle: 'MiniStack',
    // user: user,
  });
};
