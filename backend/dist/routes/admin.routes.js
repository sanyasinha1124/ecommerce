"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const admin_controller_1 = require("../controllers/admin.controller");
const authenticate_1 = require("../middleware/authenticate");
const authorize_1 = require("../middleware/authorize");
const multer_1 = require("../config/multer");
const router = (0, express_1.Router)();
// Double-locked — both middleware must pass for every admin route
router.use(authenticate_1.authenticate, (0, authorize_1.authorize)('admin'));
// Products — upload.single('image') processes multipart/form-data
router.get('/products', admin_controller_1.AdminController.listProducts);
router.post('/products', multer_1.upload.single('image'), admin_controller_1.createProductValidation, admin_controller_1.AdminController.createProduct);
router.put('/products/:id', multer_1.upload.single('image'), admin_controller_1.AdminController.updateProduct);
router.delete('/products/:id', admin_controller_1.AdminController.deleteProduct);
// Customers
router.get('/customers', admin_controller_1.AdminController.listCustomers);
router.patch('/customers/:id/lock', admin_controller_1.AdminController.toggleLock);
// Orders
router.get('/orders', admin_controller_1.AdminController.listOrders);
router.get('/orders/:id', admin_controller_1.AdminController.getOrderDetail);
exports.default = router;
