import express from 'express';
const router = express.Router();

import * as controller from '../../controllers/admin/adminProfile.controller';

router.get('/', controller.index);

// POST update basic info
router.post('/update-basic', controller.updateBasicInfo);

// POST change password
router.post('/change-password', controller.changePassword);

export const profileRoute = router;
