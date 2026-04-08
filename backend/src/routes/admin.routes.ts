import { Router } from 'express';
import { AdminController, createProductValidation } from '../controllers/admin.controller';
import { authenticate } from '../middleware/authenticate';
import { authorize } from '../middleware/authorize';
import { upload } from '../config/multer';

const router = Router();

// Double-locked — both middleware must pass for every admin route
router.use(authenticate, authorize('admin'));

// Products — upload.single('image') processes multipart/form-data
router.get('/products',           AdminController.listProducts);
router.post('/products',          upload.single('image'), createProductValidation, AdminController.createProduct);
router.put('/products/:id',       upload.single('image'), AdminController.updateProduct);
router.delete('/products/:id',    AdminController.deleteProduct);

// Customers
router.get('/customers',          AdminController.listCustomers);
router.patch('/customers/:id/lock', AdminController.toggleLock);

// Orders
router.get('/orders',             AdminController.listOrders);
router.get('/orders/:id',         AdminController.getOrderDetail);

export default router;