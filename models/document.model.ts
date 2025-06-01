import { DataTypes } from 'sequelize';
import sequelize from '../config/database';

const Document = sequelize.define(
  'Document',
  {
    DocumentID: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    Title: DataTypes.STRING(255),
    Description: DataTypes.TEXT,
    FilePath: DataTypes.STRING(255),
    UploadDate: DataTypes.DATE,
    UploadBy: {
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
    tableName: 'Document',
    timestamps: false,
  }
);

export default Document;
