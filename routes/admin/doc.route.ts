import express from 'express';
const router = express.Router();

import * as controller from '../../controllers/admin/doc.controller';

router.get('/', controller.index);

export const docRoute = router;
