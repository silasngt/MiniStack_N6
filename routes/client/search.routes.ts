import { Router } from 'express';
import searchController from '../../controllers/client/search.controller';

const router = Router();

router.get('/', searchController.search);

export const searchRoute = router;
