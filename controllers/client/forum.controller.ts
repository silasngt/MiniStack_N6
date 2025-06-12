import { Request, Response } from 'express';
import ForumTopic from '../../models/forum-topic.model';
import Category from '../../models/category.model';
import Comment from '../../models/comment.model';
import sequelize from '../../config/database';

export const index = async (req: Request, res: Response) => {
  try {
    // Sử dụng raw query để lấy topics với comment count
    const topicsWithComments: any = await sequelize.query(`
      SELECT 
        ft.TopicID,
        ft.Title,
        ft.Content,
        ft.CreatedAt,
        u.FullName as AuthorName,
        COUNT(c.CommentID) as CommentCount
      FROM ForumTopic ft
      LEFT JOIN User u ON ft.AuthorID = u.UserID
      LEFT JOIN Comment c ON ft.TopicID = c.TopicID 
        AND c.deleted = false 
        AND c.status = 'active'
      WHERE ft.deleted = false 
        AND ft.status = 'active'
      GROUP BY ft.TopicID, ft.Title, ft.Content, ft.CreatedAt, u.FullName
      ORDER BY ft.CreatedAt DESC
      LIMIT 10
    `);

    const topics = topicsWithComments[0]; // Sequelize raw query returns array with results at index 0
    
    console.log('=== DEBUG TOPICS WITH COMMENTS ===');
    console.log('Topics data:', JSON.stringify(topics, null, 2));
    console.log('=================================');

    res.render('client/pages/forumTopic/index.pug', {
      pageTitle: 'Diễn đàn',
      topics,
    });
  } catch (error) {
    console.error('Lỗi khi lấy danh sách câu hỏi:', error);
    res.render('client/pages/forumTopic/index.pug', {
      pageTitle: 'Diễn đàn',
      topics: [],
      error: 'Không thể tải danh sách câu hỏi.',
    });
  }
};

export const exchangeIndex = async (req: Request, res: Response) => {
  res.render('client/pages/forumTopic/forumExchange.pug', {
    pageTitle: 'Diễn đàn trao đổi',
  });
};

export const question = async (req: Request, res: Response) => {
  try {
    const categories = await Category.findAll({
      where: {
        deleted: false,
        status: 'active',
      },
      attributes: ['CategoryID', 'Name'],
    });
    console.log('Categories (all data):', JSON.stringify(categories, null, 2));
    if (!categories || categories.length === 0) {
      console.log('Warning: No categories found in database.');
    }
    res.render('client/pages/forumTopic/question.pug', {
      pageTitle: 'Thêm câu hỏi',
      categories,
    });
  } catch (error) {
    console.error('Error in question:', error.stack);
    res.render('client/pages/forumTopic/question.pug', {
      pageTitle: 'Thêm câu hỏi',
      categories: [],
      error: 'Không thể tải danh mục, vui lòng thử lại.',
    });
  }
};

export const createQuestion = async (req: Request, res: Response) => {
  console.log('User in createQuestion:', req.user);
  try {
    const { Title, Content, CategoryID } = req.body;

    if (!Title || !Content || !CategoryID) {
      return res.status(400).render('client/pages/forumTopic/question.pug', {
        pageTitle: 'Thêm câu hỏi',
        error: 'Vui lòng điền đầy đủ các trường bắt buộc.',
        categories: await Category.findAll({
          where: { deleted: false, status: 'active' },
          attributes: ['CategoryID', 'Name'],
        }),
      });
    }

    await ForumTopic.create({
      Title,
      Content,
      AuthorID: req.user?.UserID,
      CategoryID,
      CreatedAt: new Date(),
      deleted: false,
      status: 'active',
    });

    res.redirect('/forum');
  } catch (error) {
    console.error(error);
    res.status(500).render('client/pages/forumTopic/question.pug', {
      pageTitle: 'Thêm câu hỏi',
      error: 'Có lỗi xảy ra khi tạo câu hỏi.',
      categories: await Category.findAll({
        where: { deleted: false, status: 'active' },
        attributes: ['CategoryID', 'Name'],
      }),
    });
  }
};

export const exchangeDetail = async (req: Request, res: Response): Promise<void> => {
  const topicId = req.params.topicId;
  
  try {
    // Lấy thông tin topic
    const topicResults: any = await sequelize.query(`
      SELECT 
        ft.*,
        u.FullName as AuthorName
      FROM ForumTopic ft
      LEFT JOIN User u ON ft.AuthorID = u.UserID
      WHERE ft.TopicID = ${topicId}
        AND ft.deleted = false 
        AND ft.status = 'active'
    `);
    
    const topicData = topicResults[0];
    
    if (!topicData || topicData.length === 0) {
      res.status(404).send('Không tìm thấy bài viết');
      return;
    }
    
    const topic = topicData[0];
    
    // Lấy danh sách bình luận
    const commentResults: any = await sequelize.query(`
      SELECT 
        c.*,
        u.FullName as AuthorName
      FROM Comment c
      LEFT JOIN User u ON c.AuthorID = u.UserID
      WHERE c.TopicID = ${topicId}
        AND c.deleted = false 
        AND c.status = 'active'
      ORDER BY c.CreatedAt ASC
    `);
    
    const commentData = commentResults[0];
    const comments = commentData || [];
    
    console.log('=== DEBUG COMMENTS ===');
    console.log('Comment results:', JSON.stringify(comments, null, 2));
    console.log('======================');
    
    res.render('client/pages/forumTopic/forumExchange', {
      topic: topic,
      comments: comments
    });
    
  } catch (error: any) {
    console.error('Lỗi khi lấy dữ liệu topic và bình luận:', error);
    res.status(500).send('Lỗi server');
  }
};

export const addComment = async (req, res) => {
  const topicId = parseInt(req.params.topicId, 10);
  const { Content } = req.body;
  
  console.log('=== DEBUG ADD COMMENT ===');
  console.log('Session:', req.session);
  console.log('User in session:', req.session?.user);

  const user = (req.session as { user?: { UserID: number } }).user;
  const AuthorID = user?.UserID || null;
  console.log('AuthorID:', AuthorID);
  console.log('========================');

  if (!Content || !topicId) {
    return res.status(400).send('Thiếu dữ liệu');
  }

  try {
    await Comment.create({
      Content,
      CreatedAt: new Date(),
      AuthorID,
      TopicID: topicId,
      deleted: false,
      status: 'active',
    });

    res.redirect(`/forum/exchange/${topicId}`);
  } catch (error) {
    console.error('Lỗi khi thêm bình luận:', error);
    res.status(500).send('Lỗi máy chủ');
  }
};