import { Express } from 'express';
import { dashboardRoute } from './dashboard.route';
import { systemConfig } from '../../config/system';
import { profileRoute } from './adminProfile.route';

export const routesAdmin = (app: Express) => {
  const path = systemConfig.prefixAdmin;
  app.use(`/${path}/dashboard`, dashboardRoute);
  app.use(`/${path}/profile`, profileRoute);
};
