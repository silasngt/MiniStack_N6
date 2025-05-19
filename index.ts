import express, { Express, Request, Response } from 'express';
import dotenv from 'dotenv';
dotenv.config();
import sequelize from './config/database';

//Kết nối database
sequelize;

const app: Express = express();
const port: number = 3000;

// Cài đặt PUG cho dự án
app.set('views', `${__dirname}/views`); //Mặc định express sẽ đi tìm vào thư mục view
app.set('view engine', 'pug'); // Thiết lập phần template engines sẽ sử dụng cho dự án

app.get('/ministack', (req: Request, res: Response) => {
  res.render('client/pages/stack/index.pug');
});

app.listen(port, () => {
  console.log(`App listening on port http://localhost:${port}`);
});
