import express from 'express';
const router = express.Router();

import * as controller from '../../controllers/client/compile.controller';

router.get('/', controller.index);
router.post('/compile', controller.compileCode); // Route POST mới

export const compileRoute = router;
