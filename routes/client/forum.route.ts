import express from 'express';
const router = express.Router();

import * as controller from '../../controllers/client/forum.controller';


router.get('/', controller.index);
router.get('/exchange', controller.exchangeIndex);
router.get('/exchange/:topicId', controller.exchangeDetail); // Thêm dòng này
router.get('/question', controller.question);
router.post('/question', controller.createQuestion);
router.post('/exchange/:topicId/add-comment', controller.addComment);

export const forumRoute = router;