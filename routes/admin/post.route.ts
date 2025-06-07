import express from 'express';
import multer from 'multer';
const router = express.Router();

import * as controller from '../../controllers/admin/post.controller';
import { uploadSingle } from '../../middlewares/admin/uploadCloud.middleware';

// Cấu hình multer để handle multiple files
const upload = multer();

router.get('/', controller.index);
router.get('/create', controller.create);

// Route để tạo post mới với upload nhiều ảnh - UNCOMMENT
router.post(
  '/create',
  upload.single('image'),
  uploadSingle, //
  controller.createPost
);

export const postRoute = router;
