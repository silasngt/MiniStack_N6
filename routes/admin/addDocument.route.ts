import express from 'express';
const router = express.Router();

import * as controller from '../../controllers/admin/addDocument.controller';

router.get('/', controller.index);

export const addDocumentRoute = router;
