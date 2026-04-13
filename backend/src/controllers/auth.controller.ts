import { Request, Response, NextFunction } from 'express';
import { body, validationResult } from 'express-validator';
import { AuthService } from '../services/auth.service';

const IS_PROD = process.env.NODE_ENV === 'production';

// Validation rule sets — defined once, reused in routes
export const registerValidation = [
  body('name').trim().notEmpty().withMessage('Name is required'),
  body('email').isEmail().normalizeEmail().withMessage('Valid email required'),
  body('password')
    .isLength({ min: 8 }).withMessage('Password must be at least 8 characters')
    .matches(/[A-Z]/).withMessage('Password must contain an uppercase letter')
    .matches(/[0-9]/).withMessage('Password must contain a number'),
];

export const loginValidation = [
  body('email').isEmail().normalizeEmail(),
  body('password').notEmpty(),
];

// Helper — reads validation errors and sends 422 if any exist
function validate(req: Request, res: Response): boolean {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    res.status(422).json({ errors: errors.array() });
    return false;
  }
  return true;
}

export class AuthController {

  static async register(req: Request, res: Response, next: NextFunction) {
    if (!validate(req, res)) return;
    try {
      const result = await AuthService.register(req.body);
      res.status(201).json(result);
    } catch (err: any) {
      if (err.status) {
        res.status(err.status).json({ message: err.message });
      } else {
        next(err); // Call the global error => app.ts || 501 internal error if not handled there
      }
    }
  }

  static async login(req: Request, res: Response, next: NextFunction) {
    if (!validate(req, res)) return;
    try {
      const { token, user } = await AuthService.login(req.body);
      res
        .cookie('token', token, {
          httpOnly: true,                  // JS cannot read this cookie
          secure: IS_PROD,                 // HTTPS only in production
          sameSite: 'strict',              // Blocks CSRF from cross-site requests
          maxAge: 8 * 60 * 60 * 1000,     // 8 hours in milliseconds
        })
        .json({ user });
    } catch (err: any) {
      if (err.status) {
        res.status(err.status).json({ message: err.message });
      } else {
        next(err);
      }
    }
  }

  static async logout(req: Request, res: Response, next: NextFunction) {
    try {
      await AuthService.logout(req.user!.sessionId);
      res.clearCookie('token').json({ message: 'Logged out successfully' });
    } catch (err) { next(err); }
  }

  static async forgotPassword(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await AuthService.forgotPassword(req.body.email);
      res.json(result);
    } catch (err) { next(err); }
  }

  static async resetPassword(req: Request, res: Response, next: NextFunction) {
    try {
      await AuthService.resetPassword(req.body);
      res.json({ message: 'Password reset successful' });
    } catch (err: any) {
      if (err.status) {
        res.status(err.status).json({ message: err.message });
      } else {
        next(err);
      }
    }
  }
// important from frontend to call this method "getMe" — it's used in auth.service.ts and auth.controller.ts
  static async getMe(req: Request, res: Response, next: NextFunction) {
  try {
    const user = await AuthService.getMe(req.user!.userId);
    res.json(user);
  } catch (err: any) {
    if (err.status) res.status(err.status).json({ message: err.message });
    else next(err);
  }
}

static async updateProfile(req: Request, res: Response, next: NextFunction) {
  try {
    const user = await AuthService.updateProfile(req.user!.userId, req.body);
    res.json(user);
  } catch (err: any) {
    if (err.status) res.status(err.status).json({ message: err.message });
    else next(err);
  }
}

static async changePassword(req: Request, res: Response, next: NextFunction) {
  try {
    await AuthService.changePassword(req.user!.userId, req.body);
    // Clear cookie — user must log in again
    res.clearCookie('token').json({ message: 'Password changed. Please log in again.' });
  } catch (err: any) {
    if (err.status) res.status(err.status).json({ message: err.message });
    else next(err);
  }
}
}