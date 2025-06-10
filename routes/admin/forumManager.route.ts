import express from 'express';
const router = express.Router();

import * as controller from '../../controllers/admin/forumManager.controller';

router.get('/', controller.index);
router.patch('/update-status/:id', controller.updateStatus);
router.patch('/update-title/:id', controller.updateTitle);
router.delete('/delete/:id', controller.deleteTopic);

export const forumManagerRoute = router;
