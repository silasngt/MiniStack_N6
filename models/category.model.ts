import { DataTypes } from 'sequelize';
import sequelize from '../config/database';

const Category = sequelize.define(
  'Category',
  {
    CategoryID: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    Name: DataTypes.STRING(255),
    Type: DataTypes.ENUM('Post', 'Document', 'Forum'),
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
    tableName: 'Category',
    timestamps: false,
  }
);

export default Category;
