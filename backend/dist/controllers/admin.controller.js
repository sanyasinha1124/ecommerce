"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AdminController = exports.createProductValidation = void 0;
const express_validator_1 = require("express-validator");
const admin_service_1 = require("../services/admin.service");
exports.createProductValidation = [
    (0, express_validator_1.body)('name').trim().notEmpty().withMessage('Product name is required'),
    (0, express_validator_1.body)('description').trim().notEmpty().withMessage('Description is required'),
    (0, express_validator_1.body)('price').isFloat({ min: 0 }).withMessage('Price must be a positive number'),
    (0, express_validator_1.body)('stock').isInt({ min: 0 }).withMessage('Stock must be a non-negative integer'),
    (0, express_validator_1.body)('subCategoryId').isInt({ min: 1 }).withMessage('Valid subCategoryId required'),
];
function handleError(err, res, next) {
    if (err.status) {
        res.status(err.status).json({ message: err.message });
    }
    else {
        next(err);
    }
}
class AdminController {
    // ─── Products ─────────────────────────────────────────────────────────────
    static async listProducts(req, res, next) {
        try {
            res.json(await admin_service_1.AdminService.listProducts());
        }
        catch (err) {
            handleError(err, res, next);
        }
    }
    static async createProduct(req, res, next) {
        const errors = (0, express_validator_1.validationResult)(req);
        if (!errors.isEmpty()) {
            res.status(422).json({ errors: errors.array() });
            return;
        }
        try {
            // req.file is populated by Multer if an image was uploaded
            const imagePath = req.file ? req.file.filename : undefined;
            const product = await admin_service_1.AdminService.createProduct(req.body, imagePath);
            res.status(201).json(product);
        }
        catch (err) {
            handleError(err, res, next);
        }
    }
    static async updateProduct(req, res, next) {
        try {
            const imagePath = req.file ? req.file.filename : undefined;
            const product = await admin_service_1.AdminService.updateProduct(Number(req.params.id), req.body, imagePath);
            res.json(product);
        }
        catch (err) {
            handleError(err, res, next);
        }
    }
    static async deleteProduct(req, res, next) {
        try {
            res.json(await admin_service_1.AdminService.deleteProduct(Number(req.params.id)));
        }
        catch (err) {
            handleError(err, res, next);
        }
    }
    // ─── Customers ────────────────────────────────────────────────────────────
    static async listCustomers(req, res, next) {
        try {
            res.json(await admin_service_1.AdminService.listCustomers());
        }
        catch (err) {
            handleError(err, res, next);
        }
    }
    static async toggleLock(req, res, next) {
        try {
            res.json(await admin_service_1.AdminService.toggleLock(Number(req.params.id)));
        }
        catch (err) {
            handleError(err, res, next);
        }
    }
    // ─── Orders ───────────────────────────────────────────────────────────────
    static async listOrders(req, res, next) {
        try {
            res.json(await admin_service_1.AdminService.listAllOrders());
        }
        catch (err) {
            handleError(err, res, next);
        }
    }
    static async getOrderDetail(req, res, next) {
        try {
            res.json(await admin_service_1.AdminService.getOrderDetail(Number(req.params.id)));
        }
        catch (err) {
            handleError(err, res, next);
        }
    }
}
exports.AdminController = AdminController;
