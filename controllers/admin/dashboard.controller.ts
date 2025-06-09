import { Request, Response } from 'express';
import ForumTopic from '../../models/forum-topic.model';
import User from '../../models/user.model';
import Post from '../../models/post.model';
import Document from '../../models/document.model';

export const index = async (req: Request, res: Response) => {
  const totalForumTopics = await ForumTopic.count({
    where: {
      deleted: false,
      status: 'active',
    },
  });
  const totalUsers = await User.count({
    where: {
      deleted: false,
      status: 'active',
    },
  });
  const totalPost = await Post.count({
    where: {
      deleted: false,
      status: 'active',
    },
  });
  const totalDocument = await Document.count({
    where: {
      deleted: false,
      status: 'active',
    },
  });
  // console.log('Total forum topics:', totalForumTopics);
  res.render('admin/pages/dashboard/index.pug', {
    pageTitle: 'Dashboard',
    totalForumTopics: totalForumTopics,
    totalUsers: totalUsers,
    totalPost: totalPost,
    totalDocument: totalDocument,
  });
};
