import express from 'express';
const router = express.Router();

import * as controller from '../../controllers/admin/user.controller';

router.get('/', controller.index);
router.get('/add', controller.add);
router.get('/edit/:id', controller.edit);
router.post('/add', controller.create);
router.post('/update', controller.update);
router.post('/toggle-status/:id', controller.toggleStatus);

export const userRoute = router;
