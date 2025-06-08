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
    Phone: {
      type: DataTypes.STRING(10),
      validate: {
        is: {
          args: [/^\d{10}$/],
          msg: 'Phone must be exactly 11 digits',
        },
      },
    },
    Gender: DataTypes.ENUM('Nam', 'Nữ', 'Khác'),
    Avatar: DataTypes.STRING(255),
    Role: DataTypes.ENUM('User', 'Admin'),
    deleted: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
    status: {
      type: DataTypes.ENUM('active', 'inactive'),
      defaultValue: 'active',
    },
    createdAt: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
    },
  },
  {
    tableName: 'User',
    timestamps: false,
  }
);

export default User;
