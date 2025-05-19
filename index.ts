import express, { Express, Request, Response } from 'express';

const app: Express = express();
const port: number = 3000;

app.get('/', (req: Request, res: Response) => {
  res.send('Trang chủ');
});

app.listen(port, () => {
  console.log(`Server is running at http://localhost:${port}`);
});
