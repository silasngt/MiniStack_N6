import { Express } from 'express';
import { dashboardRoute } from './dashboard.route';
import { systemConfig } from '../../config/system';

export const routesAdmin = (app: Express) => {
  const path = systemConfig.prefixAdmin;
  app.use(`/${path}/dashboard`, dashboardRoute);
};
