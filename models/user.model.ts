import { DataTypes } from 'sequelize';
import sequelize from '../config/database';

const User = sequelize.define(
  'User',
  {
    UserID: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    FullName: DataTypes.STRING(255),
    Email: {
      type: DataTypes.STRING(255),
      unique: true,
    },
    Password: DataTypes.STRING(255),
    Gender: DataTypes.ENUM('Nam', 'Nữ', 'Khác'),
    Avatar: DataTypes.STRING(255),
    Role: DataTypes.ENUM('User', 'Admin'),
    Phone: {
      type: DataTypes.STRING(20),
      allowNull: true,
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
    tableName: 'User',
    timestamps: false,
  }
);

export default User;
