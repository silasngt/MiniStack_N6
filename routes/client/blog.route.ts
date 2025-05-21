import express from 'express';
const router = express.Router();

import * as controller from '../../controllers/client/blog.controller';

router.get('/', controller.index);

export const blogRoute = router;
