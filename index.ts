import express, { Express, Request, Response } from 'express';
import dotenv from 'dotenv';
dotenv.config();
import cookieParser from 'cookie-parser';
import {
  addUserToViews,
  checkAuth,
} from './middlewares/client/auth.middleware';
import sequelize from './config/database';
import { routesClient } from './routes/client/index.routes';
import { routesAdmin } from './routes/admin/index.routes';
import { systemConfig } from './config/system';
import session from 'express-session';
import methodOverride from 'method-override';
import flash from 'express-flash';
//Kết nối database
sequelize;

const app: Express = express();
const port: number = 3000;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

//Nhúng các file tĩnh vào
app.use(express.static(`${__dirname}/public`));

// Cài đặt PUG cho dự án
app.set('views', `${__dirname}/views`);
app.set('view engine', 'pug');

// Cài đặt method-override để hỗ trợ PUT, PATCH, DELETE
app.use(methodOverride('_method'));

// Biến toàn cục để sử dụng ở tất cả các file PUG
app.locals.prefixAdmin = systemConfig.prefixAdmin;

// QUAN TRỌNG: Session cho admin phải được khai báo TRƯỚC
app.use(
  session({
    secret: 'your_secret_key',
    resave: false,
    saveUninitialized: false,
  })
);

// Flash messages cho admin
app.use(flash());

// QUAN TRỌNG: Parse JSON và cookies PHẢI CÓ TRƯỚC middleware auth
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser()); // PHẢI CÓ TRƯỚC checkAuth

// Middleware cho CLIENT (JWT-based auth) - SAU khi đã có cookieParser
app.use(checkAuth);
app.use(addUserToViews);

// Nhúng các Routes vào app
routesClient(app);
routesAdmin(app);

app.listen(port, () => {
  console.log(`App listening on port http://localhost:${port}`);
});
