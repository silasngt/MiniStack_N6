import { Request, Response } from 'express';
import { QueryTypes } from 'sequelize';
import { ForumTopic, User } from '../../models/index.model';
import sequelize from '../../config/database';

export const index = async (req: Request, res: Response) => {
  try {
    // Sử dụng raw query để lấy topics với comment count như trang client
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
    `, {
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
      commentCount: parseInt(topic.CommentCount) || 0, // Thêm số lượng comment
    }));

    console.log('=== DEBUG ADMIN TOPICS ===');
    console.log('Topics with comments:', JSON.stringify(formattedTopics, null, 2));
    console.log('==========================');

    res.render('admin/pages/forumManager/forumManager.pug', {
      pageTitle: 'Quản lý diễn đàn',
      questions: formattedTopics,
    });
  } catch (err) {
    console.error('Error in admin forum index:', err);
    res.status(500).send('Lỗi server');
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