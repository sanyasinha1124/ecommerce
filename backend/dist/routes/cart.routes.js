"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const cart_controller_1 = require("../controllers/cart.controller");
const authenticate_1 = require("../middleware/authenticate");
const authorize_1 = require("../middleware/authorize");
const router = (0, express_1.Router)();
// All cart routes require a logged-in customer
router.use(authenticate_1.authenticate, (0, authorize_1.authorize)('customer'));
router.get('/', cart_controller_1.CartController.getCart);
router.post('/items', cart_controller_1.CartController.addItem);
router.patch('/items/:itemId', cart_controller_1.CartController.updateQuantity);
router.delete('/items/:itemId', cart_controller_1.CartController.removeItem);
exports.default = router;
