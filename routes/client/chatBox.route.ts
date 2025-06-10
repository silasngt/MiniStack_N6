import express from 'express';
const router = express.Router();
import * as controller from '../../controllers/client/chatBox.controller';

router.get('/', controller.index);
router.post('/ask', controller.chatAPI); // API chat

export const chatBoxRoute = router;
