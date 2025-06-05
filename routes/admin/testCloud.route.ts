import express from 'express';
const router = express.Router();
// Liên quan đến upload ảnh lên Cloudinary
import multer from 'multer';
import {
  uploadFields,
  uploadSingle,
} from '../../middlewares/admin/uploadCloud.middleware';

const upload = multer();
import * as controller from '../../controllers/admin/testCloud.controller';

router.get('/', controller.index);
router.post(
  '/',
  upload.single('testCloud'),
  uploadSingle,
  controller.postImage
);
router.post(
  '/imageField',
  upload.fields([{ name: 'testCloudMultiple', maxCount: 10 }]),
  uploadFields,
  controller.imageField
);

export const testCloudRoute = router;
