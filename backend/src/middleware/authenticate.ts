import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { SessionStore } from '../session/store';

const JWT_SECRET = process.env.JWT_SECRET || 'dev_secret_change_in_prod';

export interface AuthPayload {
  sessionId: string;
  userId: number;
  role: string;
}

// Extends Express Request so controllers can read req.user
declare global {
  namespace Express {
    interface Request {
      user?: AuthPayload;
    }
  }
}

export function authenticate(req: Request, res: Response, next: NextFunction): void {
  const token = req.cookies?.token;

  if (!token) {
    res.status(401).json({ message: 'Not authenticated' });
    return;
  }

  try {
    const payload = jwt.verify(token, JWT_SECRET) as AuthPayload;

    // Cookie is valid — now check session store (catches immediate account locks)
    const session = SessionStore.get(payload.sessionId);
    if (!session) {
      res.status(401).json({ message: 'Session expired. Please log in again.' });
      return;
    }

    req.user = payload;
    next();
  } catch {
    res.status(401).json({ message: 'Invalid token' });
  }
}