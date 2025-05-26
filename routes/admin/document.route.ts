import express from 'express';
const router = express.Router();

import * as controller from '../../controllers/admin/document.controller';

router.get('/', controller.index);

export const documentRoute = router;
