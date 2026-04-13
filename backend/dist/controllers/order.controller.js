"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.OrderController = exports.placeOrderValidation = void 0;
const express_validator_1 = require("express-validator");
const order_service_1 = require("../services/order.service");
exports.placeOrderValidation = [
    (0, express_validator_1.body)('paymentMethod')
        .isIn(['credit_card', 'debit_card', 'cash_on_delivery', 'bank_transfer'])
        .withMessage('Invalid payment method'),
];
function handleError(err, res, next) {
    if (err.status) {
        res.status(err.status).json({ message: err.message });
    }
    else {
        next(err);
    }
}
class OrderController {
    // POST /api/orders
    static async placeOrder(req, res, next) {
        const errors = (0, express_validator_1.validationResult)(req);
        if (!errors.isEmpty()) {
            res.status(422).json({ errors: errors.array() });
            return;
        }
        try {
            const order = await order_service_1.OrderService.placeOrder(req.user.userId, req.body.paymentMethod);
            // 201 Created — with full order detail for confirmation page
            res.status(201).json(order);
        }
        catch (err) {
            handleError(err, res, next);
        }
    }
    // GET /api/orders
    static async getOrders(req, res, next) {
        try {
            const orders = await order_service_1.OrderService.getOrders(req.user.userId);
            res.json(orders);
        }
        catch (err) {
            handleError(err, res, next);
        }
    }
    // GET /api/orders/:id
    static async getOrderDetail(req, res, next) {
        try {
            const order = await order_service_1.OrderService.getOrderDetail(req.user.userId, Number(req.params.id));
            res.json(order);
        }
        catch (err) {
            handleError(err, res, next);
        }
    }
}
exports.OrderController = OrderController;
