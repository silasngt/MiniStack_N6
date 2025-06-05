import { DataTypes } from 'sequelize';
import sequelize from '../config/database';

const ForumTopic = sequelize.define(
  'ForumTopic',
  {
    TopicID: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    Title: DataTypes.STRING(255),
    Content: DataTypes.TEXT,
    CreatedAt: DataTypes.DATE,
    AuthorID: {
      type: DataTypes.INTEGER,
      references: {
        model: 'User',
        key: 'UserID',
      },
    },
    CategoryID: {
      type: DataTypes.INTEGER,
      references: {
        model: 'Category',
        key: 'CategoryID',
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
    tableName: 'ForumTopic',
    timestamps: false,
  }
);

export default ForumTopic;
