import express, { Router } from 'express';
import * as controller from '../../controllers/admin/categories.controller';

const router: Router = express.Router();

router.get('/', controller.index);
router.get('/add', controller.addForm);
router.get('/edit/:id', controller.editForm);
router.post('/add', controller.add);
router.post('/edit/:id', controller.edit);
router.post('/delete/:id', controller.deleteCategory);
router.post('/toggle-status/:id', controller.toggleStatus);

export const categoriesRoute = router;
