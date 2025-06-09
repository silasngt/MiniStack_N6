import { Sequelize } from 'sequelize';
const fs = require('fs');
const sequelize = new Sequelize(
  process.env.DB_NAME,
  process.env.DB_USERNAME,
  process.env.DB_PASSWORD,
  {
    host: process.env.DB_HOST,
    port: Number(process.env.DB_PORT),
    dialect: 'mysql',
    dialectOptions: {
      ssl: {
        ca: fs.readFileSync(__dirname + '/certs/ca.pem'), // bạn phải lưu file `ca.pem` tại đây
        rejectUnauthorized: false, //tắt xác thực
      },
    },
    logging: false,
  }
);

sequelize
  .authenticate()
  .then(() => {
    console.log('Kết nối database thành công');
  })
  .catch((error) => {
    console.error('Kết nối database thất bại: ', error);
  });
export default sequelize;
