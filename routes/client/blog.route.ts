import express from 'express';
const router = express.Router();

import * as controller from '../../controllers/client/blog.controller';
router.get('/', controller.index);
router.get('/:id', controller.detailBlog);

export const blogRoute = router;
