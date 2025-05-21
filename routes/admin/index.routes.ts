import { Express } from 'express';
import { dashboardRoute } from './dashboard.route';
let { ADMIN_NAME } = process.env;
export const routesAdmin = (app: Express) => {
  app.use(`/${ADMIN_NAME}/dashboard`, dashboardRoute);
};
