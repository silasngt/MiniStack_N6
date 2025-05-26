import express from 'express';
const router = express.Router();

import * as controller from '../../controllers/admin/auth.controller';

router.get('/', controller.index);

export const authRoute = router;
