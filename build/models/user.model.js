"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const sequelize_1 = require("sequelize");
const database_1 = __importDefault(require("../config/database"));
const User = database_1.default.define('User', {
    UserID: {
        type: sequelize_1.DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
    },
    FullName: sequelize_1.DataTypes.STRING(255),
    Email: {
        type: sequelize_1.DataTypes.STRING(255),
        unique: true,
    },
    Password: sequelize_1.DataTypes.STRING(255),
    Phone: {
        type: sequelize_1.DataTypes.STRING(10),
        validate: {
            is: {
                args: [/^\d{10}$/],
                msg: 'Phone must be exactly 11 digits',
            },
        },
    },
    Gender: sequelize_1.DataTypes.ENUM('Nam', 'Nữ', 'Khác'),
    Avatar: sequelize_1.DataTypes.STRING(255),
    Role: sequelize_1.DataTypes.ENUM('User', 'Admin'),
    deleted: {
        type: sequelize_1.DataTypes.BOOLEAN,
        defaultValue: false,
    },
    status: {
        type: sequelize_1.DataTypes.ENUM('active', 'inactive'),
        defaultValue: 'active',
    },
    createdAt: {
        type: sequelize_1.DataTypes.DATE,
        allowNull: false,
        defaultValue: sequelize_1.DataTypes.NOW,
    },
}, {
    tableName: 'User',
    timestamps: false,
});
exports.default = User;
