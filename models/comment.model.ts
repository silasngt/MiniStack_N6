import { DataTypes } from 'sequelize';
import sequelize from '../config/database';

const Comment = sequelize.define(
  'Comment',
  {
    CommentID: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    Content: DataTypes.TEXT,
    CreatedAt: DataTypes.DATE,
    AuthorID: {
      type: DataTypes.INTEGER,
      references: {
        model: 'User',
        key: 'UserID',
      },
    },
    TopicID: {
      type: DataTypes.INTEGER,
      references: {
        model: 'ForumTopic',
        key: 'TopicID',
      },
    },
    deleted: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
    status: {
      type: DataTypes.ENUM('active', 'inactive'),
      defaultValue: 'active',
    },
  },
  {
    tableName: 'Comment',
    timestamps: false,
  }
);

export default Comment;
