import express from 'express';
const router = express.Router();

import * as controller from '../../controllers/client/compile.controller';
import { requireClientLogin } from '../../middlewares/client/auth.middleware';

router.get('/', controller.index);
router.post('/compile', requireClientLogin, controller.compileCode); // Route POST mới

export const compileRoute = router;
