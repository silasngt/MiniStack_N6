import { Express } from 'express';
import { miniStackRoute } from './miniStack.route';
import { forumTopicRoute } from './forumTopic.route';
import { blogRoute } from './blog.route';

export const routesClient = (app: Express) => {
  app.use('/', miniStackRoute);
  app.use('/forum-topic', forumTopicRoute);
  app.use('/blog', blogRoute);
};
