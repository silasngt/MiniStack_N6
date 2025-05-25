import { Express } from 'express';
import { dashboardRoute } from './dashboard.route';
import { systemConfig } from '../../config/system';
import { profileRoute } from './adminProfile.route';
import { docRoute } from './doc.route';

export const routesAdmin = (app: Express) => {
  const path = systemConfig.prefixAdmin;
  app.use(`/${path}/dashboard`, dashboardRoute);
  app.use(`/${path}/profile`, profileRoute);
  app.use(`/${path}/quan-ly-bai-viet`, docRoute);
};
