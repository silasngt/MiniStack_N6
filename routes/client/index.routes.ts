import { Express } from 'express';
import { miniStackRoute } from './miniStack.route';
import { forumTopicRoute } from './forumTopic.route';
import { blogRoute } from './blog.route';
import authRoute from './auth.route';
import { ProfileRoute } from './Profile.route';
import { documentRoute } from './document.route';

import { forumExchangeRoute } from './forumExchange.route';
import { chatBoxRoute } from './chatBox.route';
import { compileRoute } from './compile.route';
import { searchRoute } from './search.routes';
import { requireClientLogin } from '../../middlewares/client/auth.middleware';
export const routesClient = (app: Express) => {
  app.use('/', miniStackRoute);
  app.use('/forum-topic', forumTopicRoute);
  app.use('/blog', requireClientLogin, blogRoute);
  app.use('/auth', authRoute);
  app.use('/Profile', ProfileRoute);
  app.use('/forumExchange', forumExchangeRoute);
  app.use('/chatBox', chatBoxRoute);
  app.use('/compile', compileRoute);
  app.use('/search', searchRoute);

  app.use('/document', documentRoute);
};
