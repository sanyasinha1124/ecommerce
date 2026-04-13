"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.authenticate = authenticate;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const store_1 = require("../session/store");
const JWT_SECRET = process.env.JWT_SECRET || 'dev_secret_change_in_prod';
function authenticate(req, res, next) {
    const token = req.cookies?.token;
    if (!token) {
        res.status(401).json({ message: 'Not authenticated' });
        return;
    }
    try {
        const payload = jsonwebtoken_1.default.verify(token, JWT_SECRET);
        // Cookie is valid — now check session store (catches immediate account locks)
        const session = store_1.SessionStore.get(payload.sessionId);
        if (!session) {
            res.status(401).json({ message: 'Session expired. Please log in again.' });
            return;
        }
        req.user = payload;
        next();
    }
    catch {
        res.status(401).json({ message: 'Invalid token' });
    }
}
