import { DataTypes } from 'sequelize';
import sequelize from '../config/database';

const Post = sequelize.define(
  'Post',
  {
    PostID: {
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
    Images: {
      type: DataTypes.TEXT,
      allowNull: true,
      get() {
        const raw = this.getDataValue('Images');
        return raw ? JSON.parse(raw) : [];
      },
      set(val: string[]) {
        this.setDataValue('Images', JSON.stringify(val || []));
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
    tableName: 'Post',
    timestamps: false,
  }
);

export default Post;
