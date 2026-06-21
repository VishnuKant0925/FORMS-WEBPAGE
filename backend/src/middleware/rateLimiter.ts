import rateLimit from 'express-rate-limit';

// ─── Global Rate Limiter (100 req/min per IP) ─────────────
export const globalRateLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 100,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Too many requests. Please slow down.' },
});

// ─── Login Rate Limiter (10 attempts per 15 min per IP) ───
export const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Too many login attempts. Try again after 15 minutes.' },
});
