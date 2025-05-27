import { Express } from 'express';
import { dashboardRoute } from './dashboard.route';
import { userRoute } from './user.route';
import { categoriesRoute } from './categories.route';
import { authRoute } from './auth.route';
import { documentRoute } from './document.route';
import { addDocumentRoute } from './addDocument.route';
import { forumManagerRoute } from './forumManager.route';
import { systemConfig } from '../../config/system';
import { profileRoute } from './adminProfile.route';
import { postRoute } from './post.route';


export const routesAdmin = (app: Express) => {
  const path = systemConfig.prefixAdmin;
  app.use(`/${path}/dashboard`, dashboardRoute);
  app.use(`/${path}/profile`, profileRoute);
  app.use(`/${path}/posts`, postRoute);
  app.use(`/${path}/user`, userRoute);
  app.use(`/${path}/categories`, categoriesRoute);
  app.use(`/${path}/auth`, authRoute);
  app.use(`/${path}/document`, documentRoute);
  app.use(`/${path}/addDocument`, addDocumentRoute);
  app.use(`/${path}/forumManager`, forumManagerRoute);
};
