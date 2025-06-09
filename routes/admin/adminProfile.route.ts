import express from 'express';
import multer from 'multer';
const router = express.Router();

import * as controller from '../../controllers/admin/adminProfile.controller';
import { uploadSingle } from '../../middlewares/admin/uploadCloud.middleware';

const upload = multer();

router.get('/', controller.index);

// POST update basic info
router.post('/update-basic', controller.updateBasicInfo);

// POST change password
router.post('/change-password', controller.changePassword);

// POST upload avatar
router.post(
  '/upload-avatar',
  upload.single('avatar'),
  uploadSingle,
  controller.uploadAvatar
);

export const profileRoute = router;
