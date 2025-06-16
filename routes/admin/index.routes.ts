// import { Express } from 'express';
// import { dashboardRoute } from './dashboard.route';
// import { userRoute } from './user.route';
// import { categoriesRoute } from './categories.route';
// import { authRoute } from './auth.route';
// import { documentRoute } from './document.route';

// import { forumManagerRoute } from './forumManager.route';
// import { systemConfig } from '../../config/system';
// import { profileRoute } from './adminProfile.route';
// import { postRoute } from './post.route';
// import { testCloudRoute } from './testCloud.route';
// import {
//   addAdminUserToViews,
//   requireAdminLogin,
// } from '../../middlewares/admin/auth.middleware';
// import session from 'express-session';

// export const routesAdmin = (app: Express) => {
//   const path = systemConfig.prefixAdmin;
//   app.use(`/${path}`, addAdminUserToViews);
//   app.use(`/${path}/dashboard`, requireAdminLogin, dashboardRoute);
//   app.use(`/${path}/profile`, requireAdminLogin, profileRoute);
//   app.use(`/${path}/posts`, requireAdminLogin, postRoute);
//   app.use(`/${path}/user`, requireAdminLogin, userRoute);
//   app.use(`/${path}/categories`, requireAdminLogin, categoriesRoute);
//   app.use(`/${path}/auth`, authRoute);
//   app.use(`/${path}/document`, requireAdminLogin, documentRoute);
//   app.use(`/${path}/forumManager`, requireAdminLogin, forumManagerRoute);
//   app.use(`/${path}/testCloud`, testCloudRoute);
// };

// routes/admin/index.ts
import { Express } from 'express';
import { dashboardRoute } from './dashboard.route';
import { userRoute } from './user.route';
import { categoriesRoute } from './categories.route';
import { authRoute } from './auth.route';
import { documentRoute } from './document.route';
import { forumManagerRoute } from './forumManager.route';
import { systemConfig } from '../../config/system';
import { profileRoute } from './adminProfile.route';
import { postRoute } from './post.route';
import { testCloudRoute } from './testCloud.route';
import {
  addAdminUserToViews,
  requireAdminLogin,
} from '../../middlewares/admin/auth.middleware';

export const routesAdmin = (app: Express) => {
  const path = systemConfig.prefixAdmin;

  // Middleware để add admin user vào views
  app.use(`/${path}`, addAdminUserToViews);

  // Các routes với middleware authentication
  app.use(`/${path}/dashboard`, requireAdminLogin, dashboardRoute);
  app.use(`/${path}/profile`, requireAdminLogin, profileRoute);
  app.use(`/${path}/posts`, requireAdminLogin, postRoute);
  app.use(`/${path}/user`, requireAdminLogin, userRoute);
  app.use(`/${path}/categories`, requireAdminLogin, categoriesRoute);
  app.use(`/${path}/auth`, authRoute);
  app.use(`/${path}/document`, requireAdminLogin, documentRoute);
  app.use(`/${path}/forumManager`, requireAdminLogin, forumManagerRoute);
  app.use(`/${path}/testCloud`, testCloudRoute);
};
