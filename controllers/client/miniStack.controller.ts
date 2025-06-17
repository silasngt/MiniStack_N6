import { Request, Response } from 'express';
import Post from '../../models/post.model';
import Category from '../../models/category.model';
import User from '../../models/user.model';
import moment from 'moment';
import ForumTopic from '../../models/forum-topic.model';

export const index = async (req: Request, res: Response) => {
  try {
    const posts = await Post.findAll({
      where: {
        deleted: false,
        status: 'active',
      },
      raw: true,
    });

    const postsWithDetails = await Promise.all(
      posts.map(async (post) => {
        let categoryIds: number[] = [];
        try {
          categoryIds =
            typeof post['Categories'] === 'string'
              ? JSON.parse(post['Categories'])
              : [];
        } catch (error) {
          console.error(
            `Error parsing Categories for PostID ${post['PostID']}:`,
            error
          );
        }

        const categories = await Category.findAll({
          where: {
            CategoryID: categoryIds,
            deleted: false,
            status: 'active',
          },
          attributes: ['CategoryID', 'Name'],
          raw: true,
        });

        const author = await User.findOne({
          where: {
            UserID: post['AuthorID'],
            deleted: false,
            status: 'active',
          },
          attributes: ['FullName'],
          raw: true,
        });

        return {
          ...post,
          CategoryNames: categories.map((cat) => cat['Name']),
          AuthorName: author ? author['FullName'] : 'Unknown',
          FormattedCreatedAt: moment(post['createdAt']).format('DD MMMM YYYY'),
        };
      })
    );

    const forumTopic = await ForumTopic.findAll({
      where: {
        deleted: false,
        status: 'active',
      },
      raw: true,
    });
    // console.log(forumTopic);
    res.render('client/pages/stack/index.pug', {
      pageTitle: 'Trang chủ',
      posts: postsWithDetails,
      forumTopics: forumTopic,

      isHomePage: true,
    });
  } catch (error) {
    console.error('Error in blog controller:', error);
    res.status(500).send('Internal Server Error');
  }
};
