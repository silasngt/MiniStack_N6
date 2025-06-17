import User from './user.model';
import ForumTopic from './forum-topic.model';

// Thiết lập quan hệ
User.hasMany(ForumTopic, { foreignKey: 'AuthorID' });
ForumTopic.belongsTo(User, { foreignKey: 'AuthorID' });

// Export để các file khác dùng
export {
  User,
  ForumTopic,
};
