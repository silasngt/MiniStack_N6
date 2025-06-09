import express from 'express';
const router = express.Router();
import multer from 'multer';
import { uploadSingle } from '../../middlewares/admin/uploadCloud.middleware';

const upload = multer();
import * as controller from '../../controllers/client/profile.controller';

router.get('/:id', controller.index);
router.patch('/edit/:id', controller.editPatch);
router.patch('/edit-password/:id', controller.editPasswordPatch);
router.get('/history', controller.history);

export const ProfileRoute = router;
