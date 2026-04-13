"use strict";
// Plain Map — lives in Node.js process memory for the lifetime of the server
// Key: sessionId (same value stored in the JWT)
// Value: userId + role — everything the auth middleware needs without a DB hit
Object.defineProperty(exports, "__esModule", { value: true });
exports.SessionStore = void 0;
// The single source of truth for active sessions
const sessionStore = new Map();
exports.SessionStore = {
    set(sessionId, data) {
        sessionStore.set(sessionId, data);
    },
    get(sessionId) {
        return sessionStore.get(sessionId);
    },
    delete(sessionId) {
        sessionStore.delete(sessionId);
    },
    // Used by admin account-lock: removes ALL sessions for a given userId
    deleteByUserId(userId) {
        for (const [key, val] of sessionStore.entries()) {
            if (val.userId === userId)
                sessionStore.delete(key);
        }
    },
};
