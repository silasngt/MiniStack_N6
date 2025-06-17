"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const sequelize_1 = require("sequelize");
const fs = require('fs');
const sequelize = new sequelize_1.Sequelize(process.env.DB_NAME, process.env.DB_USERNAME, process.env.DB_PASSWORD, {
    host: process.env.DB_HOST,
    port: Number(process.env.DB_PORT),
    dialect: 'mysql',
    dialectOptions: {
        ssl: {
            ca: fs.readFileSync(__dirname + '/certs/ca.pem'),
            rejectUnauthorized: false,
        },
    },
    logging: false,
});
sequelize
    .authenticate()
    .then(() => {
    console.log('Kết nối database thành công');
})
    .catch((error) => {
    console.error('Kết nối database thất bại: ', error);
});
exports.default = sequelize;
