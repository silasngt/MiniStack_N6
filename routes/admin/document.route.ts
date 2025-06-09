import express from 'express';
const router = express.Router();

import * as controller from '../../controllers/admin/document.controller';

router.get('/', controller.index);
router.get('/addDocument',controller.addDocument);

export const documentRoute = router;
