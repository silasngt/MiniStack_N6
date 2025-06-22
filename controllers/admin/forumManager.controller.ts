import { Request, Response } from 'express';
import { QueryTypes } from 'sequelize';
import { ForumTopic, User } from '../../models/index.model';
import sequelize from '../../config/database';

export const index = async (req: Request, res: Response) => {
  try {
    // Lấy query parameters
    const limit = parseInt(req.query.limit as string) || 5;
    const page = parseInt(req.query.page as string) || 1;
    const offset = (page - 1) * limit;

    // Đếm tổng số topic để tính totalPages
    const totalTopics = await sequelize.query(`
      SELECT COUNT(*) as total
      FROM ForumTopic ft
      LEFT JOIN User u ON ft.AuthorID = u.UserID
      WHERE ft.deleted = false 
        AND u.deleted = false 
        AND u.status = 'active'
    `, {
      type: QueryTypes.SELECT
    });

    const totalCount = (totalTopics[0] as any).total;
    const totalPages = Math.ceil(totalCount / limit);

    // Sử dụng raw query để lấy topics với comment count và pagination
    const topicsWithComments: any = await sequelize.query(`
      SELECT 
        ft.TopicID,
        ft.Title,
        ft.Content,
        ft.CreatedAt,
        ft.status,
        u.FullName,
        u.Email,
        COUNT(c.CommentID) as CommentCount
      FROM ForumTopic ft
      LEFT JOIN User u ON ft.AuthorID = u.UserID
      LEFT JOIN Comment c ON ft.TopicID = c.TopicID 
        AND c.deleted = false 
        AND c.status = 'active'
      WHERE ft.deleted = false 
        AND u.deleted = false 
        AND u.status = 'active'
      GROUP BY ft.TopicID, ft.Title, ft.Content, ft.CreatedAt, ft.status, u.FullName, u.Email
      ORDER BY ft.CreatedAt DESC
      LIMIT :limit OFFSET :offset
    `, {
      replacements: { limit, offset },
      type: QueryTypes.SELECT
    });

    // Chuyển định dạng dữ liệu
    const formattedTopics = topicsWithComments.map((topic: any) => ({
      id: topic.TopicID,
      content: topic.Title,
      name: topic.FullName || 'N/A',
      email: topic.Email || 'N/A',
      date: topic.CreatedAt
        ? new Date(topic.CreatedAt).toLocaleDateString('vi-VN')
        : '',
      status: topic.status,
      commentCount: parseInt(topic.CommentCount) || 0,
    }));



    res.render('admin/pages/forumManager/forumManager.pug', {
      pageTitle: 'Quản lý diễn đàn',
      questions: formattedTopics,
      currentPage: page,
      totalPages,
      limit,
    });
  } catch (err) {
    console.error('Error in admin forum index:', err);
    res.render('admin/pages/forumManager/forumManager.pug', {
      pageTitle: 'Quản lý diễn đàn',
      questions: [],
      currentPage: 1,
      totalPages: 1,
      limit: 10,
      error: 'Không thể tải danh sách diễn đàn.',
    });
  }
};

export const updateStatus = async (req: Request, res: Response) => {
  const { id } = req.params;
  const { status } = req.body;
  try {
    await ForumTopic.update({ status }, { where: { TopicID: id } });
    res.sendStatus(200);
  } catch (err) {
    res.status(500).send('Error updating status');
  }
};

export const updateTitle = async (req: Request, res: Response) => {
  const { id } = req.params;
  const { Title } = req.body;
  try {
    await ForumTopic.update({ Title }, { where: { TopicID: id } });
    res.sendStatus(200);
  } catch (err) {
    res.status(500).send('Error updating title');
  }
};

export const deleteTopic = async (req: Request, res: Response) => {
  const { id } = req.params;
  try {
    await ForumTopic.update({ deleted: true }, { where: { TopicID: id } });
    res.sendStatus(200);
  } catch (err) {
    res.status(500).send('Error deleting topic');
  }
};