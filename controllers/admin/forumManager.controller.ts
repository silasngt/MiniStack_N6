import { Request, Response } from 'express';
import { ForumTopic, User } from '../../models/index.model';

export const index = async (req: Request, res: Response) => {
  try {
    const topics = await ForumTopic.findAll({
      where: {
        deleted: false,
        status: 'active',
      },
      include: [
        {
          model: User,
          attributes: ['FullName', 'Email'],
          where: {
            deleted: false,
            status: 'active',
          },
        },
      ],
      order: [['CreatedAt', 'DESC']],
    });

    // Chuyển định dạng ngày
const formattedTopics = topics.map((topicInstance) => {
  const topic = topicInstance.get({ plain: true });

  return {
    id: topic.TopicID,
    content: topic.Title,
    name: topic.User?.FullName || 'N/A',
    email: topic.User?.Email || 'N/A',
    date: topic.CreatedAt
      ? new Date(topic.CreatedAt).toLocaleDateString('vi-VN')
      : '',
  };
});

    res.render('admin/pages/forumManager/forumManager.pug', {
      pageTitle: 'Quản lý diễn đàn',
      questions: formattedTopics,
    });
  } catch (err) {
    console.error(err);
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