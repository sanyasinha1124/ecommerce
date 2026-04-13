"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CartController = exports.updateQuantityValidation = exports.addItemValidation = void 0;
const express_validator_1 = require("express-validator");
const cart_service_1 = require("../services/cart.service");
exports.addItemValidation = [
    (0, express_validator_1.body)('productId').isInt({ min: 1 }).withMessage('Valid product ID required'),
    (0, express_validator_1.body)('quantity').isInt({ min: 1 }).withMessage('Quantity must be a positive integer'),
];
exports.updateQuantityValidation = [
    (0, express_validator_1.body)('quantity').isInt({ min: 1 }).withMessage('Quantity must be a positive integer'),
];
function handleError(err, res, next) {
    if (err.status) {
        res.status(err.status).json({ message: err.message });
    }
    else {
        next(err);
    }
}
class CartController {
    static async getCart(req, res, next) {
        try {
            const cart = await cart_service_1.CartService.getCart(req.user.userId);
            res.json(cart);
        }
        catch (err) {
            handleError(err, res, next);
        }
    }
    static async addItem(req, res, next) {
        const errors = (0, express_validator_1.validationResult)(req);
        if (!errors.isEmpty()) {
            res.status(422).json({ errors: errors.array() });
            return;
        }
        try {
            const { productId, quantity } = req.body;
            const cart = await cart_service_1.CartService.addItem(req.user.userId, productId, quantity);
            res.json(cart);
        }
        catch (err) {
            handleError(err, res, next);
        }
    }
    static async updateQuantity(req, res, next) {
        const errors = (0, express_validator_1.validationResult)(req);
        if (!errors.isEmpty()) {
            res.status(422).json({ errors: errors.array() });
            return;
        }
        try {
            const cart = await cart_service_1.CartService.updateQuantity(req.user.userId, Number(req.params.itemId), req.body.quantity);
            res.json(cart);
        }
        catch (err) {
            handleError(err, res, next);
        }
    }
    static async removeItem(req, res, next) {
        try {
            const cart = await cart_service_1.CartService.removeItem(req.user.userId, Number(req.params.itemId));
            res.json(cart);
        }
        catch (err) {
            handleError(err, res, next);
        }
    }
}
exports.CartController = CartController;
