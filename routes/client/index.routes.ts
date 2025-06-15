import { Express } from 'express';
import { miniStackRoute } from './miniStack.route';
import { forumRoute } from './forum.route';
import { blogRoute } from './blog.route';
import authRoute from './auth.route';
import { documentRoute } from './Document.route';
import { profileRoute } from './Profile.route';
import { chatBoxRoute } from './chatBox.route';
import { compileRoute } from './compile.route';
import { searchRoute } from './search.routes';
import contactRoute from './contact.route';
export const routesClient = (app: Express) => {
  app.use('/', miniStackRoute);
  app.use('/forum', forumRoute);
  app.use('/blog', blogRoute);
  app.use('/auth', authRoute);
  app.use('/profile', profileRoute);
  app.use('/chatBox', chatBoxRoute);
  app.use('/compile', compileRoute);
  app.use('/search', searchRoute);
  app.use('/document', documentRoute);
  app.use('/contact', contactRoute);

};
