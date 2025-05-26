import express from 'express';
const router = express.Router();

import * as controller from '../../controllers/admin/post.controller';

router.get('/', controller.index);
router.get('/them-moi', controller.create);

export const postRoute = router;
