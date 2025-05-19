import { Express } from 'express';
import { miniStackRoute } from './miniStack.route';

export const routesClient = (app: Express) => {
  app.use('/', miniStackRoute);
};
