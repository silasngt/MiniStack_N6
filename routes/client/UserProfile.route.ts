import express from 'express';
const router = express.Router();

import * as controller from '../../controllers/client/UserProfile.controller';

router.get('/', controller.index);

export const UserProfileRoute = router;
