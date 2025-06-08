import express from 'express';
const router = express.Router();

import * as controller from '../../controllers/client/Document.controller';

router.get('/', controller.index);

export const DocumentRoute = router;
