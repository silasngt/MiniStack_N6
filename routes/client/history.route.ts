import express from 'express';
const router = express.Router();

import * as controller from '../../controllers/client/history.controller';

router.get('/', controller.index);

export const historyRoute = router;
