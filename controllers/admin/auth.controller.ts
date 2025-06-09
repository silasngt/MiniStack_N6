import { Request, Response } from 'express';
import User from '../../models/user.model';
import md5 from 'md5';

export const index = async (req: Request, res: Response) => {
  res.render('admin/pages/auth/login.pug', {
    pageTitle: 'Đăng nhập admin',
    errorMessage: null,
  });
};

export const login = async (req: Request, res: Response) => {
  const { email, password } = req.body;
  console.log('email:', email, 'password:', password);
  const user = await User.findOne({
    where: { Email: email, Role: 'Admin', deleted: false },
  });
  const userPassword = user ? user.get('Password') : null;
  if (!user || userPassword !== md5(password)) {
    return res.render('admin/pages/auth/login.pug', {
      pageTitle: 'Đăng nhập admin',
      errorMessage: 'Sai tài khoản hoặc mật khẩu!',
    });
  }

  // Lấy object thuần từ instance Sequelize
  const userData = user.get({ plain: true });

  (req.session as any).adminUser = {
    id: userData.UserID,
    name: userData.FullName,
    email: userData.Email,
    role: userData.Role,
    Avatar: userData.Avatar,
  };
  res.redirect('/admin/dashboard');
};

export const logout = (req: Request, res: Response) => {
  req.session.destroy(() => {
    res.redirect('/admin/auth/login');
  });
};
