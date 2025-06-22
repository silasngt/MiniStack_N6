import { Request, Response } from 'express';
import { QueryTypes } from 'sequelize';
import ForumTopic from '../../models/forum-topic.model';
import Category from '../../models/category.model';
import Comment from '../../models/comment.model';
import sequelize from '../../config/database';

export const index = async (req: Request, res: Response) => {
  try {
    // Lấy query parameters
    const limit = parseInt(req.query.limit as string) || 5;
    const page = parseInt(req.query.page as string) || 1;
    const offset = (page - 1) * limit;

    // Đếm tổng số topic để tính totalPages
    const totalTopics = await ForumTopic.count({
      where: {
        deleted: false,
        status: 'active',
      },
    });
    const totalPages = Math.ceil(totalTopics / limit);

    // Sử dụng raw query với LIMIT và OFFSET
    const topicsWithComments: any = await sequelize.query(
      `
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
      LIMIT :limit OFFSET :offset
    `,
      {
        replacements: { limit, offset },
        type: QueryTypes.SELECT,
      }
    );

    const topics = topicsWithComments;

    res.render('client/pages/forumTopic/index.pug', {
      pageTitle: 'Diễn đàn',
      topics,
      currentPage: page,
      totalPages,
      limit,
    });
  } catch (error) {
    console.error('Lỗi khi lấy danh sách câu hỏi:', error);
    res.render('client/pages/forumTopic/index.pug', {
      pageTitle: 'Diễn đàn',
      topics: [],
      currentPage: 1,
      totalPages: 1,
      limit: 10,
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
      attributes: ['CategoryID', 'Name', 'Type'],
    });

    const rawCategories = categories.map((cat) => cat.get());
    const forumCategories = rawCategories.filter(
      (cat) => Array.isArray(cat.Type) && cat.Type.includes('Diễn đàn')
    );

    res.render('client/pages/forumTopic/question.pug', {
      pageTitle: 'Thêm câu hỏi',
      categories: forumCategories,
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

    const userId = req.user?.UserID || (req.session as any)?.user?.UserID;
    if (!userId) {
      return res.status(401).render('client/pages/forumTopic/question.pug', {
        pageTitle: 'Thêm câu hỏi',
        error: 'Bạn cần đăng nhập để tạo câu hỏi.',
        categories: await Category.findAll({
          where: { deleted: false, status: 'active' },
          attributes: ['CategoryID', 'Name'],
        }),
      });
    }

    await ForumTopic.create({
      Title,
      Content,
      AuthorID: userId,
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

export const exchangeDetail = async (
  req: Request,
  res: Response
): Promise<void> => {
  const topicId = parseInt(req.params.topicId, 10);
  if (isNaN(topicId)) {
    res.status(400).send('ID topic không hợp lệ');
    return;
  }

  try {
    const topicResults: any = await sequelize.query(
      `
      SELECT 
        ft.*,
        u.FullName as AuthorName
      FROM ForumTopic ft
      LEFT JOIN User u ON ft.AuthorID = u.UserID
      WHERE ft.TopicID = :topicId
        AND ft.deleted = false 
        AND ft.status = 'active'
    `,
      {
        replacements: { topicId },
        type: QueryTypes.SELECT,
      }
    );

    if (!topicResults || topicResults.length === 0) {
      res.status(404).send('Không tìm thấy bài viết');
      return;
    }

    const topic = topicResults[0];

    const comments: any = await sequelize.query(
      `
      SELECT 
        c.*,
        u.FullName as AuthorName
      FROM Comment c
      LEFT JOIN User u ON c.AuthorID = u.UserID
      WHERE c.TopicID = :topicId
        AND c.deleted = false 
        AND c.status = 'active'
      ORDER BY c.CreatedAt ASC
    `,
      {
        replacements: { topicId },
        type: QueryTypes.SELECT,
      }
    );

    res.render('client/pages/forumTopic/forumExchange', {
      topic,
      comments: comments || [],
      pageTitle: topic.Title,
    });
  } catch (error: any) {
    console.error('Lỗi khi lấy dữ liệu topic và bình luận:', error);
    res.status(500).send('Lỗi server');
  }
};

export const addComment = async (
  req: Request,
  res: Response
): Promise<void> => {
  const topicId = parseInt(req.params.topicId, 10);
  const { Content } = req.body;

  if (isNaN(topicId)) {
    res.status(400).send('ID topic không hợp lệ');
    return;
  }

  if (!Content || Content.trim() === '') {
    res.status(400).send('Nội dung bình luận không được để trống');
    return;
  }

  const userId = req.user?.UserID || (req.session as any)?.user?.UserID;
  if (!userId) {
    res.status(401).send('Bạn cần đăng nhập để bình luận');
    return;
  }

  try {
    const topicExists = await ForumTopic.findOne({
      where: {
        TopicID: topicId,
        deleted: false,
        status: 'active',
      },
    });

    if (!topicExists) {
      res.status(404).send('Không tìm thấy bài viết');
      return;
    }

    const newComment = await Comment.create({
      Content: Content.trim(),
      CreatedAt: new Date(),
      AuthorID: userId,
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
