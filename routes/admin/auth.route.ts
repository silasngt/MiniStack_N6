import express from 'express';
const router = express.Router();

import * as controller from '../../controllers/admin/auth.controller';

router.get('/login', controller.index);
router.post('/login', controller.login);
router.get('/logout', controller.logout);

export const authRoute = router;
