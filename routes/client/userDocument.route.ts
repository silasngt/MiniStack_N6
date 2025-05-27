import express from 'express';
const router = express.Router();

import * as controller from '../../controllers/client/userDocument.controller';

router.get('/', controller.index);

export const userDocumentRoute = router;
