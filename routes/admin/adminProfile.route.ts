import express from 'express';
const router = express.Router();

import * as controller from '../../controllers/admin/adminProfile.controller';

router.get('/', controller.index);

// POST update basic info
router.post('/update-basic', controller.updateBasicInfo);

export const profileRoute = router;
