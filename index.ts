import express, { Express, Request, Response } from 'express';
import dotenv from 'dotenv';
dotenv.config();
import sequelize from './config/database';
import { routesClient } from './routes/client/index.routes';
import { routesAdmin } from './routes/admin/index.routes';
import { systemConfig } from './config/system';
//Kết nối database
sequelize;

const app: Express = express();
const port: number = 3000;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

//Nhúng các file tĩnh vào
app.use(express.static(`${__dirname}/public`));

// Cài đặt PUG cho dự án
app.set('views', `${__dirname}/views`); //Mặc định express sẽ đi tìm vào thư mục view
app.set('view engine', 'pug'); // Thiết lập phần template engines sẽ sử dụng cho dự án

// Biến toàn cục để sử dụng ở tất cả các file PUG
app.locals.prefixAdmin = systemConfig.prefixAdmin;

// Nhúng các Routes vào app
// import { routesClient } from './routes/client/index.routes';
routesClient(app);
routesAdmin(app);
app.listen(port, () => {
  console.log(`App listening on port http://localhost:${port}`);
});
