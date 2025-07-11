import express from 'express';
import multer from 'multer';
const router = express.Router();

import * as controller from '../../controllers/admin/document.controller';
import { uploadSingle } from '../../middlewares/admin/uploadCloud.middleware';

const upload = multer({
  storage: multer.memoryStorage(),
});

router.get('/', controller.index);
router.get('/create', controller.create);
router.post(
  '/create',
  upload.single('thumbnail'),
  uploadSingle,
  controller.createPost
);
// Thêm routes mới
router.get('/edit/:id', controller.edit);
router.patch('/edit/:id', upload.single('thumbnail'), uploadSingle, controller.update);
router.post('/delete/:id', controller.deleteDocument);
router.post('/toggle-status/:id', controller.toggleStatus); 

export const documentRoute = router;
