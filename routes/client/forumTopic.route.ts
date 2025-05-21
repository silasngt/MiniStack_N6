import express from 'express';
const router = express.Router();

import * as controller from '../../controllers/client/forumTopic.controller';

router.get('/', controller.index);

export const forumTopicRoute = router;
