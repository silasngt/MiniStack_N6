import express from 'express';
import multer from 'multer';
const router = express.Router();

import * as controller from '../../controllers/admin/document.controller';
import { uploadSingle } from '../../middlewares/admin/uploadCloud.middleware';

const upload = multer({
  storage: multer.memoryStorage()
});

router.get('/', controller.index);
router.get('/create', controller.addDocument);
router.post('/create', 
  upload.single('document'),
  uploadSingle,
  controller.create
);
// Thêm routes mới
router.get('/edit/:id', controller.edit);
router.post('/edit/:id', 
  upload.single('thumbnail'),
  controller.update
);
router.delete('/:id', controller.deleteDocument);
router.patch('/status/:id', controller.updateStatus);


export const documentRoute = router;