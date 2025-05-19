import express from 'express';
const router = express.Router();

import * as controller from '../../controllers/client/miniStack.controller';

router.get('/', controller.index);

export const miniStackRoute = router;
