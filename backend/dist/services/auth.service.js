"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthService = void 0;
const bcrypt_1 = __importDefault(require("bcrypt"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const uuid_1 = require("uuid");
const data_source_1 = require("../config/data-source");
const User_1 = require("../entities/User");
const Cart_1 = require("../entities/Cart");
const store_1 = require("../session/store");
const JWT_SECRET = process.env.JWT_SECRET || 'dev_secret_change_in_prod';
const BCRYPT_ROUNDS = 12;
const RESET_CODE_EXPIRY_MINUTES = 10;
const userRepo = () => data_source_1.AppDataSource.getRepository(User_1.User);
const cartRepo = () => data_source_1.AppDataSource.getRepository(Cart_1.Cart);
class AuthService {
    static async register(body) {
        const { name, email, password } = body;
        // Check duplicate email
        const existing = await userRepo().findOneBy({ email });
        if (existing)
            throw { status: 409, message: 'Email already registered' };
        // Hash password — never store plain text
        const passwordHash = await bcrypt_1.default.hash(password, BCRYPT_ROUNDS);
        const user = userRepo().create({ name, email, passwordHash, role: 'customer' });
        await userRepo().save(user);
        // Create an empty cart for this user immediately on registration
        // This ensures cart always exists when customer logs in
        const cart = cartRepo().create({ user });
        await cartRepo().save(cart);
        return { message: 'Registration successful' };
    }
    static async login(body) {
        const { email, password } = body;
        const user = await userRepo().findOneBy({ email });
        // Use same error for wrong email AND wrong password — prevents user enumeration
        if (!user)
            throw { status: 401, message: 'Invalid email or password' };
        const passwordMatch = await bcrypt_1.default.compare(password, user.passwordHash);
        if (!passwordMatch)
            throw { status: 401, message: 'Invalid email or password' };
        if (user.isLocked)
            throw { status: 403, message: 'Account is locked. Contact support.' };
        // sessionId ties the JWT to the in-memory session store entry
        const sessionId = (0, uuid_1.v4)();
        const token = jsonwebtoken_1.default.sign({ sessionId, userId: user.id, role: user.role }, JWT_SECRET, { expiresIn: '8h' });
        // Register session in store — this is what makes account-lock enforcement work
        store_1.SessionStore.set(sessionId, { userId: user.id, role: user.role });
        return {
            token,
            user: { id: user.id, name: user.name, email: user.email, role: user.role },
        };
    }
    static async logout(sessionId) {
        // Remove from store — cookie cleared by controller
        store_1.SessionStore.delete(sessionId);
    }
    static async forgotPassword(email) {
        const user = await userRepo().findOneBy({ email });
        // Always return success — don't reveal whether email exists
        if (!user)
            return { message: 'If that email exists, a code has been generated.', code: null };
        // 6-digit numeric code
        const code = Math.floor(100000 + Math.random() * 900000).toString();
        const expiry = new Date(Date.now() + RESET_CODE_EXPIRY_MINUTES * 60 * 1000);
        user.resetCode = code;
        user.resetCodeExpiry = expiry;
        await userRepo().save(user);
        // In a real system this would be emailed — for this project we return it directly
        return {
            message: 'Reset code generated.',
            code, // Displayed on screen as per rubric
        };
    }
    // important for frontend to call this method "resetPassword" — it's used in auth.service.ts and auth.controller.ts
    static async getMe(userId) {
        const user = await userRepo().findOne({
            where: { id: userId },
            select: ['id', 'name', 'email', 'role', 'isLocked'],
        });
        if (!user)
            throw { status: 404, message: 'User not found' };
        if (user.isLocked)
            throw { status: 403, message: 'Account is locked' };
        return { id: user.id, name: user.name, email: user.email, role: user.role };
    }
    static async resetPassword(body) {
        const { email, code, newPassword } = body;
        const user = await userRepo().findOneBy({ email });
        if (!user || !user.resetCode || !user.resetCodeExpiry) {
            throw { status: 400, message: 'Invalid or expired reset code' };
        }
        // Check expiry
        if (new Date() > user.resetCodeExpiry) {
            throw { status: 400, message: 'Reset code has expired' };
        }
        if (user.resetCode !== code) {
            throw { status: 400, message: 'Invalid reset code' };
        }
        // Hash new password and clear the reset fields
        user.passwordHash = await bcrypt_1.default.hash(newPassword, BCRYPT_ROUNDS);
        user.resetCode = null;
        user.resetCodeExpiry = null;
        await userRepo().save(user);
        // Invalidate all active sessions for this user — force re-login with new password
        store_1.SessionStore.deleteByUserId(user.id);
    }
    static async updateProfile(userId, body) {
        const { name, email } = body;
        // Check new email isn't taken by another user
        const conflict = await userRepo().findOneBy({ email });
        if (conflict && conflict.id !== userId) {
            throw { status: 409, message: 'Email already in use' };
        }
        const user = await userRepo().findOneBy({ id: userId });
        if (!user)
            throw { status: 404, message: 'User not found' };
        user.name = name;
        user.email = email;
        await userRepo().save(user);
        return { id: user.id, name: user.name, email: user.email, role: user.role };
    }
    static async changePassword(userId, body) {
        const user = await userRepo().findOneBy({ id: userId });
        if (!user)
            throw { status: 404, message: 'User not found' };
        const match = await bcrypt_1.default.compare(body.currentPassword, user.passwordHash);
        if (!match)
            throw { status: 401, message: 'Current password is incorrect' };
        user.passwordHash = await bcrypt_1.default.hash(body.newPassword, BCRYPT_ROUNDS);
        await userRepo().save(user);
        // Invalidate all sessions — force re-login with new password
        store_1.SessionStore.deleteByUserId(userId);
    }
}
exports.AuthService = AuthService;
