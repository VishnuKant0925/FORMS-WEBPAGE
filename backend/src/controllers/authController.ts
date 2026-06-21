import { Request, Response } from 'express';
import argon2 from 'argon2';
import jwt from 'jsonwebtoken';
import { OAuth2Client } from 'google-auth-library';
import User from '../models/User';
import AuditLog from '../models/AuditLog';
import {
  RegisterSchema,
  LoginSchema,
  GoogleLoginSchema,
  validateBody,
} from '../utils/validate';

const googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

// ─── Argon2id Options ─────────────────────────────────────
const ARGON2_OPTIONS: argon2.Options & { raw: false } = {
  type:        argon2.argon2id,
  memoryCost:  65536, // 64 MiB
  timeCost:    3,
  parallelism: 4,
  raw:         false,
};

// ─── Token Helpers ────────────────────────────────────────
const generateAccessToken = (userId: string, role: string): string =>
  jwt.sign({ userId, role }, process.env.JWT_ACCESS_SECRET!, {
    expiresIn: (process.env.JWT_ACCESS_EXPIRY ?? '15m') as any,
  });

const generateRefreshToken = (userId: string): string =>
  jwt.sign({ userId }, process.env.JWT_REFRESH_SECRET!, {
    expiresIn: (process.env.JWT_REFRESH_EXPIRY ?? '7d') as any,
  });

const setRefreshCookie = (res: Response, token: string): void => {
  res.cookie('refreshToken', token, {
    httpOnly:  true,
    secure:    process.env.NODE_ENV === 'production',
    sameSite:  'strict',          // protects against CSRF in all environments
    maxAge:    7 * 24 * 60 * 60 * 1000,
    path:      '/api/auth',
  });
};

// ─── Register ─────────────────────────────────────────────
export const register = async (req: Request, res: Response): Promise<void> => {
  const validation = validateBody(RegisterSchema, req.body);
  if (!validation.success) {
    res.status(400).json({ error: validation.errors[0], details: validation.errors });
    return;
  }
  const { name, email, password } = validation.data;

  try {
    const existing = await User.findOne({ email }).select('_id').lean();
    if (existing) {
      res.status(409).json({ error: 'Email is already registered' });
      return;
    }
    const passwordHash = await argon2.hash(password, ARGON2_OPTIONS);
    const user         = await User.create({ name, email, passwordHash, authProvider: 'local' });

    const accessToken  = generateAccessToken(String(user._id), user.role);
    const refreshToken = generateRefreshToken(String(user._id));
    user.refreshToken  = await argon2.hash(refreshToken, ARGON2_OPTIONS);
    await user.save();

    await AuditLog.create({ userId: user._id, action: 'USER_REGISTER', target: email });

    setRefreshCookie(res, refreshToken);
    res.status(201).json({
      user: { id: user._id, name: user.name, email: user.email, role: user.role },
      accessToken,
    });
  } catch (err) {
    console.error('[auth] register error:', err);
    res.status(500).json({ error: 'Registration failed. Please try again.' });
  }
};

// ─── Login ────────────────────────────────────────────────
export const login = async (req: Request, res: Response): Promise<void> => {
  const validation = validateBody(LoginSchema, req.body);
  if (!validation.success) {
    res.status(400).json({ error: validation.errors[0] });
    return;
  }
  const { email, password } = validation.data;

  try {
    const user = await User.findOne({ email, authProvider: 'local' });
    if (!user?.passwordHash) {
      // Constant-time: still hash to prevent timing attacks
      await argon2.hash('dummy-password', ARGON2_OPTIONS);
      res.status(401).json({ error: 'Invalid email or password' });
      return;
    }
    const valid = await argon2.verify(user.passwordHash, password);
    if (!valid) {
      res.status(401).json({ error: 'Invalid email or password' });
      return;
    }

    const accessToken  = generateAccessToken(String(user._id), user.role);
    const refreshToken = generateRefreshToken(String(user._id));
    user.refreshToken  = await argon2.hash(refreshToken, ARGON2_OPTIONS);
    await user.save();

    await AuditLog.create({ userId: user._id, action: 'USER_LOGIN', target: 'local' });

    setRefreshCookie(res, refreshToken);
    res.json({
      user: { id: user._id, name: user.name, email: user.email, role: user.role },
      accessToken,
    });
  } catch (err) {
    console.error('[auth] login error:', err);
    res.status(500).json({ error: 'Login failed. Please try again.' });
  }
};

// ─── Google OAuth Login ───────────────────────────────────
export const googleLogin = async (req: Request, res: Response): Promise<void> => {
  const validation = validateBody(GoogleLoginSchema, req.body);
  if (!validation.success) {
    res.status(400).json({ error: validation.errors[0] });
    return;
  }
  const { credential } = validation.data;

  try {
    const ticket  = await googleClient.verifyIdToken({ idToken: credential, audience: process.env.GOOGLE_CLIENT_ID });
    const payload = ticket.getPayload();
    if (!payload?.sub || !payload.email) {
      res.status(401).json({ error: 'Invalid Google token' });
      return;
    }
    const { sub: googleId, email, name } = payload;

    // Find by googleId first, then by email (link accounts)
    let user = await User.findOne({ googleId });
    if (!user) {
      user = await User.findOne({ email });
      if (user) {
        // Link existing local account to Google
        user.googleId     = googleId;
        user.authProvider = 'google';
      } else {
        // Create new Google user
        user = new User({ email, name: name ?? email, googleId, authProvider: 'google' });
      }
    }

    const accessToken  = generateAccessToken(String(user._id), user.role);
    const refreshToken = generateRefreshToken(String(user._id));
    user.refreshToken  = await argon2.hash(refreshToken, ARGON2_OPTIONS);
    await user.save();

    await AuditLog.create({ userId: user._id, action: 'USER_LOGIN', target: 'google' });

    setRefreshCookie(res, refreshToken);
    res.json({
      user: { id: user._id, name: user.name, email: user.email, role: user.role },
      accessToken,
    });
  } catch (err) {
    console.error('[auth] google login error:', err);
    res.status(401).json({ error: 'Google authentication failed' });
  }
};

// ─── Refresh Token ────────────────────────────────────────
export const refresh = async (req: Request, res: Response): Promise<void> => {
  const token = req.cookies.refreshToken as string | undefined;
  if (!token) {
    res.status(401).json({ error: 'No refresh token provided' });
    return;
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_REFRESH_SECRET!) as { userId: string };
    const user    = await User.findById(decoded.userId).select('+refreshToken');
    if (!user?.refreshToken) {
      res.status(401).json({ error: 'Invalid or revoked session' });
      return;
    }
    const valid = await argon2.verify(user.refreshToken, token);
    if (!valid) {
      // Possible token theft — invalidate all sessions
      user.refreshToken = undefined;
      await user.save();
      res.clearCookie('refreshToken', { path: '/api/auth' });
      res.status(401).json({ error: 'Session invalidated due to security concern. Please log in again.' });
      return;
    }
    // Rotate tokens (refresh token rotation)
    const newAccessToken  = generateAccessToken(String(user._id), user.role);
    const newRefreshToken = generateRefreshToken(String(user._id));
    user.refreshToken     = await argon2.hash(newRefreshToken, ARGON2_OPTIONS);
    await user.save();

    setRefreshCookie(res, newRefreshToken);
    res.json({
      accessToken: newAccessToken,
      user: { id: user._id, name: user.name, email: user.email, role: user.role }
    });
  } catch (err) {
    if (err instanceof jwt.TokenExpiredError) {
      res.status(401).json({ error: 'Session expired. Please log in again.' });
    } else {
      res.status(401).json({ error: 'Invalid session' });
    }
  }
};

// ─── Logout ───────────────────────────────────────────────
export const logout = async (req: Request, res: Response): Promise<void> => {
  const token = req.cookies.refreshToken as string | undefined;
  if (token) {
    try {
      const decoded = jwt.verify(token, process.env.JWT_REFRESH_SECRET!) as { userId: string };
      await User.findByIdAndUpdate(decoded.userId, { $unset: { refreshToken: '' } });
    } catch { /* token expired or invalid — still clear cookie */ }
  }
  res.clearCookie('refreshToken', { path: '/api/auth', httpOnly: true, sameSite: 'strict' });
  res.json({ message: 'Logged out successfully' });
};
