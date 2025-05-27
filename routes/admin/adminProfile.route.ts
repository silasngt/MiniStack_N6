import express from 'express';
const router = express.Router();

import * as controller from '../../controllers/admin/adminProfile.controller';

router.get('/', controller.index);

export const profileRoute = router;
