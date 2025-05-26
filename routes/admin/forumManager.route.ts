import express from 'express';
const router = express.Router();

import * as controller from '../../controllers/admin/forumManager.controller';

router.get('/', controller.index);

export const forumManagerRoute = router;
