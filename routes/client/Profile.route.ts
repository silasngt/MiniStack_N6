import express from 'express';
const router = express.Router();

import * as controller from '../../controllers/client/Profile.controller';

router.get('/', controller.index);
router.get('/history', controller.history);

export const ProfileRoute = router;
