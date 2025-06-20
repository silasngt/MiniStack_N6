"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const sequelize_1 = require("sequelize");
const database_1 = __importDefault(require("../config/database"));
const ForumTopic = database_1.default.define('ForumTopic', {
    TopicID: {
        type: sequelize_1.DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
    },
    Title: sequelize_1.DataTypes.STRING(255),
    Content: sequelize_1.DataTypes.TEXT,
    CreatedAt: sequelize_1.DataTypes.DATE,
    AuthorID: {
        type: sequelize_1.DataTypes.INTEGER,
        references: {
            model: 'User',
            key: 'UserID',
        },
    },
    CategoryID: {
        type: sequelize_1.DataTypes.INTEGER,
        references: {
            model: 'Category',
            key: 'CategoryID',
        },
    },
    deleted: {
        type: sequelize_1.DataTypes.BOOLEAN,
        defaultValue: false,
    },
    status: {
        type: sequelize_1.DataTypes.ENUM('active', 'inactive'),
        defaultValue: 'active',
    },
}, {
    tableName: 'ForumTopic',
    timestamps: false,
});
exports.default = ForumTopic;
