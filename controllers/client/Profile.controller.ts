import { Request, Response } from 'express';
import User from '../../models/user.model';
import md5 from 'md5';
import ForumTopic from '../../models/forum-topic.model';

// Extend Express Request interface to include flash
declare global {
  namespace Express {
    interface Request {
      flash(type: string, message: string): void;
    }
  }
}

export const index = async (req: Request, res: Response) => {
  const userId = req.params.id;
  const infoUser = await User.findOne({
    where: {
      UserID: userId,
      deleted: false,
      status: 'active',
    },
    raw: true,
  });
  // console.log(infoUser);
  res.render('client/pages/profile/index.pug', {
    pageTitle: 'Cài đặt',
  });
};
export const history = async (req: Request, res: Response) => {
  const userId = req.params.id;
  const infoHistory = await ForumTopic.findAll({
    where: {
      AuthorID: userId,
      deleted: false,
      status: 'active',
    },
    raw: true,
  });
  const totalInfoHistory = await ForumTopic.count({
    where: {
      AuthorID: userId,
      deleted: false,
      status: 'active',
    },
  });
  res.render('client/pages/profile/history.pug', {
    pageTitle: 'Lịch sử ',
    infoHistory: infoHistory,
    totalInfoHistory: totalInfoHistory,
  });
};
export const editPatch = async (req: Request, res: Response) => {
  const userId = req.params.id;
  await User.update(
    {
      FullName: req.body.FullName,
      Phone: req.body.Phone,
    },
    {
      where: {
        UserID: userId,
        deleted: false,
        status: 'active',
      },
    }
  );
  res.redirect(`/profile/${userId}`);
};
export const editPasswordPatch = async (req: Request, res: Response) => {
  const userId = req.params.id;

  if (!req.body.CurrentPassword) {
    req.flash('error', 'Vui lòng nhập mật khẩu hiện tại');
    return res.redirect(`/profile/${userId}`);
  }

  const userPassword = await User.findOne({
    where: {
      UserID: userId,
      deleted: false,
      status: 'active',
    },
    raw: true,
  });

  if (
    !userPassword ||
    userPassword['Password'] !== md5(req.body.CurrentPassword)
  ) {
    req.flash('error', 'Mật khẩu cũ không đúng');
    return res.redirect(`/profile/${userId}`);
  }

  await User.update(
    {
      Password: md5(req.body.NewPassword),
    },
    {
      where: {
        UserID: userId,
        deleted: false,
        status: 'active',
      },
    }
  );
  req.flash('success', 'Đổi mật khẩu thành công');
  res.redirect(`/profile/${userId}`);
};
