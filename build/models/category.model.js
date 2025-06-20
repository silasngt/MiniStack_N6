"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const sequelize_1 = require("sequelize");
const database_1 = __importDefault(require("../config/database"));
const Category = database_1.default.define('Category', {
    CategoryID: {
        type: sequelize_1.DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
    },
    Name: sequelize_1.DataTypes.STRING(255),
    Type: {
        type: sequelize_1.DataTypes.TEXT,
        allowNull: false,
        get() {
            const raw = this.getDataValue('Type');
            return raw ? JSON.parse(raw) : [];
        },
        set(val) {
            this.setDataValue('Type', JSON.stringify(val));
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
    tableName: 'Category',
    timestamps: false,
});
exports.default = Category;
