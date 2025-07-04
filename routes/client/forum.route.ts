import express from 'express';
const router = express.Router();
import { requireClientLogin } from '../../middlewares/client/auth.middleware';

import * as controller from '../../controllers/client/forum.controller';

router.get('/', controller.index);
router.get('/exchange', controller.exchangeIndex);
router.get('/exchange/:topicId', controller.exchangeDetail);
router.get('/question', requireClientLogin, controller.question);
router.post('/question', controller.createQuestion);
router.post(
  '/exchange/:topicId/add-comment',
  requireClientLogin,
  controller.addComment
);

export const forumRoute = router;
