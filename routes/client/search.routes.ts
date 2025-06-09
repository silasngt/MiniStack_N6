import { Router } from 'express';
import controller from '../../controllers/client/search.controller';

const router = Router();

router.get('/', controller.search);

router.get('/suggestions', controller.searchSuggestions);

export const searchRoute = router;
