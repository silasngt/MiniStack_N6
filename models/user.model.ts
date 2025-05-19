import { DataTypes, Model } from 'sequelize';
import sequelize from '../config/database';

const User = sequelize.define(
  'User',
  {
    userid: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      allowNull: false,
      autoIncrement: true,
    },
    fullname: {
      type: DataTypes.STRING(45),
      allowNull: false,
    },
    email: {
      type: DataTypes.STRING(45),
      allowNull: false,
    },
    password: {
      type: DataTypes.STRING(45),
      allowNull: false,
    },
    gender: {
      type: DataTypes.ENUM('Nam', 'Nữ', 'Khác'),
      allowNull: true,
    },
    avatar: {
      type: DataTypes.STRING(45),
      allowNull: true,
    },
    role: {
      type: DataTypes.ENUM('User', 'Admin'),
      allowNull: false,
    },
  },
  {
    tableName: 'user',
    timestamps: false,
  }
);

export default User;
