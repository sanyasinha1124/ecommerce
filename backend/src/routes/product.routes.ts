import { Router } from 'express';
import { ProductController } from '../controllers/product.controller';

const router = Router();

router.get('/search', ProductController.search);
router.get('/taxonomy', ProductController.getTaxonomy);
router.get('/', ProductController.list);
router.get('/:id', ProductController.getOne);

export default router;