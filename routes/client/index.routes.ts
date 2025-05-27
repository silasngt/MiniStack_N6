import { Express } from 'express';
import { miniStackRoute } from './miniStack.route';
import { forumTopicRoute } from './forumTopic.route';
import { blogRoute } from './blog.route';
import { authRoute } from './auth.route';
import { UserProfileRoute } from './UserProfile.route';
import { historyRoute } from './history.route';

export const routesClient = (app: Express) => {
  app.use('/', miniStackRoute);
  app.use('/forum-topic', forumTopicRoute);
  app.use('/blog', blogRoute);
  app.use('/auth', authRoute);
  app.use ('/UserProfile',UserProfileRoute);
  app.use ('/history',historyRoute)

};
