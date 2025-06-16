import { Request, Response, NextFunction } from 'express';

export function requireAdminLogin(
  req: Request,
  res: Response,
  next: NextFunction
) {
  if ((req as any).session && (req as any).session.adminUser) {
    return next();
  }
  res.redirect('/admin/auth/login');
}

export function addAdminUserToViews(
  req: Request,
  res: Response,
  next: NextFunction
) {
  if ((req as any).session && (req as any).session.adminUser) {
    const adminUser = (req as any).session.adminUser;

    res.locals.currentUser = adminUser;
  } else {
    res.locals.currentUser = null;
  }
  next();
}
