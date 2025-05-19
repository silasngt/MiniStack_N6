import express, { Express, Request, Response } from 'express';
import dotenv from 'dotenv';
dotenv.config();
import sequelize from './config/database';
import { routesClient } from './routes/client/index.routes';

//Kết nối database
sequelize;

const app: Express = express();
const port: number = 3000;

//Nhúng các file tĩnh vào
app.use(express.static(`${__dirname}/public`));

// Cài đặt PUG cho dự án
app.set('views', `${__dirname}/views`); //Mặc định express sẽ đi tìm vào thư mục view
app.set('view engine', 'pug'); // Thiết lập phần template engines sẽ sử dụng cho dự án

// Nhúng các Routes vào app
// import { routesClient } from './routes/client/index.routes';
routesClient(app);

app.listen(port, () => {
  console.log(`App listening on port http://localhost:${port}`);
});
