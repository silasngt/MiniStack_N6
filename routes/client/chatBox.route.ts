import express from 'express';
const router = express.Router();

import * as controller from '../../controllers/client/chatBox.controller';

router.get('/', controller.index);

export const chatBoxRoute = router;
