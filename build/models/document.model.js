"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const sequelize_1 = require("sequelize");
const database_1 = __importDefault(require("../config/database"));
const Document = database_1.default.define('Document', {
    DocumentID: {
        type: sequelize_1.DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
    },
    Title: sequelize_1.DataTypes.STRING(255),
    FilePath: sequelize_1.DataTypes.STRING(255),
    UploadDate: sequelize_1.DataTypes.DATE,
    UploadBy: {
        type: sequelize_1.DataTypes.INTEGER,
        references: {
            model: 'User',
            key: 'UserID',
        },
    },
    Thumbnail: {
        type: sequelize_1.DataTypes.STRING(500),
        allowNull: false,
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
    deleted: {
        type: sequelize_1.DataTypes.BOOLEAN,
        defaultValue: false,
    },
    status: {
        type: sequelize_1.DataTypes.ENUM('active', 'inactive'),
        defaultValue: 'active',
    },
}, {
    tableName: 'Document',
    timestamps: false,
});
exports.default = Document;
