import express from 'express';
import multer from 'multer';
const router = express.Router();

import * as controller from '../../controllers/admin/post.controller';
import { uploadFields } from '../../middlewares/admin/uploadCloud.middleware';

// Cấu hình multer để handle multiple files
const upload = multer();

router.get('/', controller.index);
router.get('/create', controller.create);

// Route để tạo post mới với upload nhiều ảnh - UNCOMMENT
router.post(
  '/create',
  upload.fields([
    { name: 'images', maxCount: 10 }, // Allow up to 10 images
  ]),
  uploadFields, // Middleware upload lên Cloudinary
  controller.createPost
);

export const postRoute = router;
