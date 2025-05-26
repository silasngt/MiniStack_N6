import { Express } from 'express';
import { miniStackRoute } from './miniStack.route';
import { forumTopicRoute } from './forumTopic.route';
import { blogRoute } from './blog.route';
import { authRoute } from './auth.route';
import { forumExchangeRoute } from './forumExchange.route';
import { chatBoxRoute } from './chatBox.route';
import { searchRoute } from './search.routes';

export const routesClient = (app: Express) => {
  app.use('/', miniStackRoute);
  app.use('/forum-topic', forumTopicRoute);
  app.use('/blog', blogRoute);
  app.use('/auth', authRoute);
  app.use('/forumExchange', forumExchangeRoute);
  app.use('/chatBox', chatBoxRoute);
  app.use('/search', searchRoute);
};
