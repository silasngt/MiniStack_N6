import express from 'express';
const router = express.Router();

import * as controller from '../../controllers/client/document.controller';


router.get('/', controller.index);

export const documentRoute = router;
