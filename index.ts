import express, { Express, Request, Response } from 'express';
import dotenv from 'dotenv';
dotenv.config();
import sequelize from './config/database';
import User from './models/user.model';

//Kết nối database
sequelize;

const app: Express = express();
const port: number = 3000;

// Cài đặt PUG cho dự án
app.set('views', `${__dirname}/views`); //Mặc định express sẽ đi tìm vào thư mục view
app.set('view engine', 'pug'); // Thiết lập phần template engines sẽ sử dụng cho dự án

app.get('/ministack', async (req: Request, res: Response) => {
  const user = await User.findAll({
    where: {
      userid: 1,
    },
    raw: true, //Giữ lại các trường dữ liệu chuẩn như trong db
  });
  console.log(user);
  res.render('client/pages/stack/index.pug', {
    pageTitle: 'MiniStack',
    user: user,
  });
});

app.listen(port, () => {
  console.log(`App listening on port http://localhost:${port}`);
});
