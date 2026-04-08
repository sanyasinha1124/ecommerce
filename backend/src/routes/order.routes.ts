import { Router } from 'express';
import { OrderController, placeOrderValidation } from '../controllers/order.controller';
import { authenticate } from '../middleware/authenticate';
import { authorize } from '../middleware/authorize';

const router = Router();

router.use(authenticate, authorize('customer'));

router.post('/',    placeOrderValidation, OrderController.placeOrder);
router.get('/',     OrderController.getOrders);
router.get('/:id',  OrderController.getOrderDetail);

export default router;