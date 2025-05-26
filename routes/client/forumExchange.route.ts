import express from 'express';
const router = express.Router();

import * as controller from '../../controllers/client/forumExchange.controller';

router.get('/', controller.index);

export const forumExchangeRoute = router;