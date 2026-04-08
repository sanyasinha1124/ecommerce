import { Request, Response, NextFunction } from 'express';
import { UserRole } from '../entities/User';

// Returns a middleware that only allows the specified roles through
export function authorize(...roles: UserRole[]) {
  return (req: Request, res: Response, next: NextFunction): void => {
    if (!req.user || !roles.includes(req.user.role as UserRole)) {
      res.status(403).json({ message: 'Forbidden' });
      return;
    }
    next();
  };
}