import express from 'express';
const router = express.Router();

import * as controller from '../../controllers/client/compile.controller';

router.get('/', controller.index);

export const compileRoute = router;
