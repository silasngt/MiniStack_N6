import express from 'express';
const router = express.Router();

import * as controller from '../../controllers/admin/dashboard.controller';

router.get('/', controller.index);

export const dashboardRoute = router;
