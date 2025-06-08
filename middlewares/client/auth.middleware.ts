import { Request, Response, NextFunction } from 'express';
import * as jwt from 'jsonwebtoken';
import User from '../../models/user.model';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

interface UserPayload {
  userId: number;
  email: string;
  role: string;
  iat?: number;
  exp?: number;
}

// Extend Request interface để thêm user property
declare global {
  namespace Express {
    interface Request {
      user?: any;
    }
  }
}

// Middleware kiểm tra đăng nhập (set req.user nếu hợp lệ)
export const checkAuth = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const token = req.cookies.auth_token;
    if (token) {
      const decoded = jwt.verify(token, JWT_SECRET) as UserPayload;
      const user = await User.findOne({
        where: {
          UserID: decoded.userId,
          deleted: false,
          status: 'active',
        },
        attributes: { exclude: ['Password'] },
      });
      if (user) {
        req.user = user.get({ plain: true });
      }
    }
    next();
  } catch (error) {
    req.user = undefined;
    next();
  }
};

// Middleware truyền thông tin user cho tất cả views
export const addUserToViews = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  res.locals.user = req.user || null;
  next();
};

// Middleware yêu cầu đăng nhập client
export function requireClientLogin(
  req: Request,
  res: Response,
  next: NextFunction
) {
  if (req.user) {
    return next();
  }
  res.redirect('/auth/login');
}
