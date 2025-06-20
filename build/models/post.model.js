"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const sequelize_1 = require("sequelize");
const database_1 = __importDefault(require("../config/database"));
const Post = database_1.default.define('Post', {
    PostID: {
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
    Categories: {
        type: sequelize_1.DataTypes.TEXT,
        allowNull: true,
        get() {
            const raw = this.getDataValue('Categories');
            return raw ? JSON.parse(raw) : [];
        },
        set(val) {
            const categoryArray = Array.isArray(val)
                ? val.map((id) => parseInt(id.toString()))
                : [];
            this.setDataValue('Categories', JSON.stringify(categoryArray));
        },
    },
    Image: {
        type: sequelize_1.DataTypes.TEXT,
        allowNull: true,
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
    tableName: 'Post',
    timestamps: false,
});
exports.default = Post;
