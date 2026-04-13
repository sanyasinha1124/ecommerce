import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { v4 as uuidv4 } from 'uuid';
import { AppDataSource } from '../config/data-source';
import { User } from '../entities/User';
import { Cart } from '../entities/Cart';
import { SessionStore } from '../session/store';

const JWT_SECRET = process.env.JWT_SECRET || 'dev_secret_change_in_prod';
const BCRYPT_ROUNDS = 12;
const RESET_CODE_EXPIRY_MINUTES = 10;

const userRepo = () => AppDataSource.getRepository(User);
const cartRepo = () => AppDataSource.getRepository(Cart);

export class AuthService {

  static async register(body: { name: string; email: string; password: string }) {
    const { name, email, password } = body;

    // Check duplicate email
    const existing = await userRepo().findOneBy({ email });
    if (existing) throw { status: 409, message: 'Email already registered' };

    // Hash password — never store plain text
    const passwordHash = await bcrypt.hash(password, BCRYPT_ROUNDS);

    const user = userRepo().create({ name, email, passwordHash, role: 'customer' });
    await userRepo().save(user);

    // Create an empty cart for this user immediately on registration
    // This ensures cart always exists when customer logs in
    const cart = cartRepo().create({ user });
    await cartRepo().save(cart);

    return { message: 'Registration successful' };
  }

  static async login(body: { email: string; password: string }) {
    const { email, password } = body;

    const user = await userRepo().findOneBy({ email });

    // Use same error for wrong email AND wrong password — prevents user enumeration
    if (!user) throw { status: 401, message: 'Invalid email or password' };

    const passwordMatch = await bcrypt.compare(password, user.passwordHash);
    if (!passwordMatch) throw { status: 401, message: 'Invalid email or password' };

    if (user.isLocked) throw { status: 403, message: 'Account is locked. Contact support.' };

    // sessionId ties the JWT to the in-memory session store entry
    const sessionId = uuidv4();

    const token = jwt.sign(
      { sessionId, userId: user.id, role: user.role },
      JWT_SECRET,
      { expiresIn: '8h' }
    );

    // Register session in store — this is what makes account-lock enforcement work
    SessionStore.set(sessionId, { userId: user.id, role: user.role });

    return {
      token,
      user: { id: user.id, name: user.name, email: user.email, role: user.role },
    };
  }

  static async logout(sessionId: string): Promise<void> {
    // Remove from store — cookie cleared by controller
    SessionStore.delete(sessionId);
  }

  static async forgotPassword(email: string) {
    const user = await userRepo().findOneBy({ email });

    // Always return success — don't reveal whether email exists
    if (!user) return { message: 'If that email exists, a code has been generated.', code: null };

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

static async getMe(userId: number) {
  const user = await userRepo().findOne({
    where: { id: userId },
    select: ['id', 'name', 'email', 'role', 'isLocked'],
  });

  if (!user) throw { status: 404, message: 'User not found' };
  if (user.isLocked) throw { status: 403, message: 'Account is locked' };

  return { id: user.id, name: user.name, email: user.email, role: user.role };
}

  static async resetPassword(body: { email: string; code: string; newPassword: string }) {
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
    user.passwordHash = await bcrypt.hash(newPassword, BCRYPT_ROUNDS);
    user.resetCode = null;
    user.resetCodeExpiry = null;
    await userRepo().save(user);

    // Invalidate all active sessions for this user — force re-login with new password
    SessionStore.deleteByUserId(user.id);
  }

  static async updateProfile(userId: number, body: { name: string; email: string }) {
  const { name, email } = body;

  // Check new email isn't taken by another user
  const conflict = await userRepo().findOneBy({ email });
  if (conflict && conflict.id !== userId) {
    throw { status: 409, message: 'Email already in use' };
  }

  const user = await userRepo().findOneBy({ id: userId });
  if (!user) throw { status: 404, message: 'User not found' };

  user.name  = name;
  user.email = email;
  await userRepo().save(user);

  return { id: user.id, name: user.name, email: user.email, role: user.role };
}

static async changePassword(userId: number, body: {
  currentPassword: string;
  newPassword: string;
}) {
  const user = await userRepo().findOneBy({ id: userId });
  if (!user) throw { status: 404, message: 'User not found' };

  const match = await bcrypt.compare(body.currentPassword, user.passwordHash);
  if (!match) throw { status: 401, message: 'Current password is incorrect' };

  user.passwordHash = await bcrypt.hash(body.newPassword, BCRYPT_ROUNDS);
  await userRepo().save(user);

  // Invalidate all sessions — force re-login with new password
  SessionStore.deleteByUserId(userId);
}
}