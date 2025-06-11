import { DataTypes } from 'sequelize';
import sequelize from '../config/database';

import User from './user.model';



const Document = sequelize.define(
  'Document',
  {
    DocumentID: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    Title: DataTypes.STRING(255),
    FilePath: DataTypes.STRING(255),
    UploadDate: DataTypes.DATE,
    UploadBy: {
      type: DataTypes.INTEGER,
      references: {
        model: 'User',
        key: 'UserID',
      },
    },
    Thumbnail: {
      type: DataTypes.STRING(500),
      allowNull: false,
    },
    Categories: {
      type: DataTypes.TEXT,
      allowNull: true,
      get() {
        const raw = this.getDataValue('Categories');
        return raw ? JSON.parse(raw) : [];
      },
      set(val: number[] | string[]) {
        const categoryArray = Array.isArray(val)
          ? val.map((id) => parseInt(id.toString()))
          : [];
        this.setDataValue('Categories', JSON.stringify(categoryArray));
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