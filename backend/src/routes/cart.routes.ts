import { Router } from 'express';
import { CartController } from '../controllers/cart.controller';
import { authenticate } from '../middleware/authenticate';
import { authorize } from '../middleware/authorize';

const router = Router();

// All cart routes require a logged-in customer
router.use(authenticate, authorize('customer'));

router.get('/', CartController.getCart);
router.post('/items', CartController.addItem);
router.patch('/items/:itemId', CartController.updateQuantity);
router.delete('/items/:itemId', CartController.removeItem);

export default router;