// Plain Map — lives in Node.js process memory for the lifetime of the server
// Key: sessionId (same value stored in the JWT)
// Value: userId + role — everything the auth middleware needs without a DB hit

export interface SessionData {
  userId: number;
  role: string;
}

// The single source of truth for active sessions
const sessionStore = new Map<string, SessionData>();

export const SessionStore = {
  set(sessionId: string, data: SessionData): void {
    sessionStore.set(sessionId, data);
  },

  get(sessionId: string): SessionData | undefined {
    return sessionStore.get(sessionId);
  },

  delete(sessionId: string): void {
    sessionStore.delete(sessionId);
  },

  // Used by admin account-lock: removes ALL sessions for a given userId
  deleteByUserId(userId: number): void {
    for (const [key, val] of sessionStore.entries()) {
      if (val.userId === userId) sessionStore.delete(key);
    }
  },
};