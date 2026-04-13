"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_controller_1 = require("../controllers/auth.controller");
const authenticate_1 = require("../middleware/authenticate");
const express_rate_limit_1 = __importDefault(require("express-rate-limit"));
// Max 10 login attempts per 15 minutes per IP
const authLimiter = (0, express_rate_limit_1.default)({
    windowMs: 15 * 60 * 1000,
    max: 10,
    message: { message: 'Too many attempts. Please try again later.' },
    standardHeaders: true,
    legacyHeaders: false,
});
const router = (0, express_1.Router)();
router.post('/register', authLimiter, auth_controller_1.registerValidation, auth_controller_1.AuthController.register);
router.post('/login', authLimiter, auth_controller_1.loginValidation, auth_controller_1.AuthController.login);
router.post('/logout', authenticate_1.authenticate, auth_controller_1.AuthController.logout);
router.post('/forgot-password', authLimiter, auth_controller_1.AuthController.forgotPassword);
router.post('/reset-password', auth_controller_1.AuthController.resetPassword);
router.get('/me', authenticate_1.authenticate, auth_controller_1.AuthController.getMe);
router.put('/profile', authenticate_1.authenticate, auth_controller_1.AuthController.updateProfile);
router.put('/change-password', authenticate_1.authenticate, auth_controller_1.AuthController.changePassword);
exports.default = router;
