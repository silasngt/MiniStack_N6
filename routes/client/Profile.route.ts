import express from 'express';
const router = express.Router();
import multer from 'multer';
import { uploadSingle } from '../../middlewares/admin/uploadCloud.middleware';
import { requireClientLogin } from '../../middlewares/client/auth.middleware';

const upload = multer();
import * as controller from '../../controllers/client/Profile.controller';

router.get('/:id', requireClientLogin, controller.index);
router.patch('/edit/:id', controller.editPatch);
router.patch('/edit-password/:id', controller.editPasswordPatch);
router.get('/history/:id', requireClientLogin, controller.history);

export const profileRoute = router;
