import express from 'express';
const router = express.Router();

import * as controller from '../../controllers/admin/user.controller';

router.get('/', controller.index);

export const userRoute = router;
