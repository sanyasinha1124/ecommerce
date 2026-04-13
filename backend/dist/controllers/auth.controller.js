"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthController = exports.loginValidation = exports.registerValidation = void 0;
const express_validator_1 = require("express-validator");
const auth_service_1 = require("../services/auth.service");
const IS_PROD = process.env.NODE_ENV === 'production';
// Validation rule sets — defined once, reused in routes
exports.registerValidation = [
    (0, express_validator_1.body)('name').trim().notEmpty().withMessage('Name is required'),
    (0, express_validator_1.body)('email').isEmail().normalizeEmail().withMessage('Valid email required'),
    (0, express_validator_1.body)('password')
        .isLength({ min: 8 }).withMessage('Password must be at least 8 characters')
        .matches(/[A-Z]/).withMessage('Password must contain an uppercase letter')
        .matches(/[0-9]/).withMessage('Password must contain a number'),
];
exports.loginValidation = [
    (0, express_validator_1.body)('email').isEmail().normalizeEmail(),
    (0, express_validator_1.body)('password').notEmpty(),
];
// Helper — reads validation errors and sends 422 if any exist
function validate(req, res) {
    const errors = (0, express_validator_1.validationResult)(req);
    if (!errors.isEmpty()) {
        res.status(422).json({ errors: errors.array() });
        return false;
    }
    return true;
}
class AuthController {
    static async register(req, res, next) {
        if (!validate(req, res))
            return;
        try {
            const result = await auth_service_1.AuthService.register(req.body);
            res.status(201).json(result);
        }
        catch (err) {
            if (err.status) {
                res.status(err.status).json({ message: err.message });
            }
            else {
                next(err); // Call the global error => app.ts || 501 internal error if not handled there
            }
        }
    }
    static async login(req, res, next) {
        if (!validate(req, res))
            return;
        try {
            const { token, user } = await auth_service_1.AuthService.login(req.body);
            res
                .cookie('token', token, {
                httpOnly: true, // JS cannot read this cookie
                secure: IS_PROD, // HTTPS only in production
                sameSite: 'strict', // Blocks CSRF from cross-site requests
                maxAge: 8 * 60 * 60 * 1000, // 8 hours in milliseconds
            })
                .json({ user });
        }
        catch (err) {
            if (err.status) {
                res.status(err.status).json({ message: err.message });
            }
            else {
                next(err);
            }
        }
    }
    static async logout(req, res, next) {
        try {
            await auth_service_1.AuthService.logout(req.user.sessionId);
            res.clearCookie('token').json({ message: 'Logged out successfully' });
        }
        catch (err) {
            next(err);
        }
    }
    static async forgotPassword(req, res, next) {
        try {
            const result = await auth_service_1.AuthService.forgotPassword(req.body.email);
            res.json(result);
        }
        catch (err) {
            next(err);
        }
    }
    static async resetPassword(req, res, next) {
        try {
            await auth_service_1.AuthService.resetPassword(req.body);
            res.json({ message: 'Password reset successful' });
        }
        catch (err) {
            if (err.status) {
                res.status(err.status).json({ message: err.message });
            }
            else {
                next(err);
            }
        }
    }
    // important from frontend to call this method "getMe" — it's used in auth.service.ts and auth.controller.ts
    static async getMe(req, res, next) {
        try {
            const user = await auth_service_1.AuthService.getMe(req.user.userId);
            res.json(user);
        }
        catch (err) {
            if (err.status)
                res.status(err.status).json({ message: err.message });
            else
                next(err);
        }
    }
    static async updateProfile(req, res, next) {
        try {
            const user = await auth_service_1.AuthService.updateProfile(req.user.userId, req.body);
            res.json(user);
        }
        catch (err) {
            if (err.status)
                res.status(err.status).json({ message: err.message });
            else
                next(err);
        }
    }
    static async changePassword(req, res, next) {
        try {
            await auth_service_1.AuthService.changePassword(req.user.userId, req.body);
            // Clear cookie — user must log in again
            res.clearCookie('token').json({ message: 'Password changed. Please log in again.' });
        }
        catch (err) {
            if (err.status)
                res.status(err.status).json({ message: err.message });
            else
                next(err);
        }
    }
}
exports.AuthController = AuthController;
