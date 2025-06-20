"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const sequelize_1 = require("sequelize");
const database_1 = __importDefault(require("../config/database"));
const TestCloud = database_1.default.define('TestCloud', {
    idtestCloud: {
        type: sequelize_1.DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false,
    },
    testCloudimage: {
        type: sequelize_1.DataTypes.STRING(500),
        allowNull: false,
    },
}, {
    tableName: 'testCloud',
    timestamps: false,
});
exports.default = TestCloud;
