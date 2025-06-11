import { Request, Response } from 'express';
import ForumTopic from '../../models/forum-topic.model';
import Category from '../../models/category.model'; // Adjust path based on your project structure
import Comment from '../../models/comment.model';


export const index = async (req: Request, res: Response) => {
  try {
    const topics = await ForumTopic.findAll({
      where: { deleted: false, status: 'active' },
      attributes: ['TopicID', 'Title', 'Content'],
      order: [['CreatedAt', 'DESC']],
      limit: 10, // hoặc số lượng bạn muốn
    });

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
    console.log('Categories (all data):', JSON.stringify(categories, null, 2)); // Debug tất cả dữ liệu
    if (!categories || categories.length === 0) {
      console.log('Warning: No categories found in database.');
    }
    res.render('client/pages/forumTopic/question.pug', {
      pageTitle: 'Thêm câu hỏi',
      categories,
    });
  } catch (error) {
    console.error('Error in question:', error.stack); // In stack trace chi tiết
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

    // Basic validation
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

    // Create new forum topic
    await ForumTopic.create({
      Title,
      Content,
      AuthorID: req.user?.UserID, // Assumes user is authenticated
      CategoryID,
      CreatedAt: new Date(),
      deleted: false,
      status: 'active',
    });

    // Redirect to forum index or question list after success
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



import sequelize from '../../config/database'; // Đường dẫn đến config database của bạn


export const exchangeDetail = (req: Request, res: Response): void => {
  const topicId = req.params.topicId;
  
  sequelize.query(`
    SELECT 
      ft.*,
      u.FullName as AuthorName
    FROM ForumTopic ft
    LEFT JOIN User u ON ft.AuthorID = u.UserID
    WHERE ft.TopicID = ${topicId}
      AND ft.deleted = false 
      AND ft.status = 'active'
  `).then((results: any) => {
    // Sequelize trả về [data, metadata], ta chỉ cần data
    const data = results[0];
    
    if (!data || data.length === 0) {
      return res.status(404).send('Không tìm thấy bài viết');
    }
    
    const topic = data[0];
    
    res.render('client/pages/forumTopic/forumExchange', {
      topic: topic
    });
  }).catch((error: any) => {
    console.error('Lỗi khi lấy dữ liệu topic:', error);
    res.status(500).send('Lỗi server');
  });
};

export const addComment = async (req, res) => {
  const topicId = parseInt(req.params.topicId, 10);
  const { Content } = req.body;

  // Giả sử bạn có lưu user khi login vào session
  const user = (req.session as { user?: { UserID: number } }).user;
  const AuthorID = user?.UserID || null;

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


