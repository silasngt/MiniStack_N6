import express from 'express';
const router = express.Router();
import { requireClientLogin } from '../../middlewares/client/auth.middleware';

import * as controller from '../../controllers/client/forum.controller';

router.get('/', controller.index);
router.get('/exchange', controller.exchangeIndex);
router.get('/exchange/:topicId', controller.exchangeDetail); // Thêm dòng này
router.get('/question', requireClientLogin, controller.question);
router.post('/question', controller.createQuestion);

export const forumRoute = router;
