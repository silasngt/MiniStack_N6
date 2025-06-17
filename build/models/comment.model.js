"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const sequelize_1 = require("sequelize");
const database_1 = __importDefault(require("../config/database"));
const Comment = database_1.default.define('Comment', {
    CommentID: {
        type: sequelize_1.DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
    },
    Content: sequelize_1.DataTypes.TEXT,
    CreatedAt: sequelize_1.DataTypes.DATE,
    AuthorID: {
        type: sequelize_1.DataTypes.INTEGER,
        references: {
            model: 'User',
            key: 'UserID',
        },
    },
    TopicID: {
        type: sequelize_1.DataTypes.INTEGER,
        references: {
            model: 'ForumTopic',
            key: 'TopicID',
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
    tableName: 'Comment',
    timestamps: false,
});
exports.default = Comment;
