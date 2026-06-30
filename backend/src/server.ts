import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import helmet from 'helmet';
import compression from 'compression';
import mongoSanitize from 'express-mongo-sanitize';
import connectDB from './config/db';
import { globalRateLimiter } from './middleware/rateLimiter';
import { errorHandler } from './middleware/errorHandler';
import authRoutes from './routes/authRoutes';
import formRoutes from './routes/formRoutes';
import pdfRoutes from './routes/pdfRoutes';
import adminRoutes from './routes/adminRoutes';
import profileRoutes from './routes/profileRoutes';
import translitRoutes from './routes/translitRoutes';

// ─── Startup Environment Validation ──────────────────────
const REQUIRED_ENV_VARS = [
  'MONGODB_URI',
  'JWT_ACCESS_SECRET',
  'JWT_REFRESH_SECRET',
  'CLIENT_URL',
] as const;

const missingVars = REQUIRED_ENV_VARS.filter(key => !process.env[key]);
if (missingVars.length > 0) {
  console.error('❌ Missing required environment variables:', missingVars.join(', '));
  console.error('   Copy backend/.env.example → backend/.env and fill in the values.');
  process.exit(1);
}

const app = express();

// ─── Connect Database ─────────────────────────────────────
connectDB();

// ─── Security Headers ─────────────────────────────────────
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      imgSrc: ["'self'", 'data:', 'https:'],
    },
  },
  hsts: { maxAge: 31536000, includeSubDomains: true, preload: true },
}));

// ─── CORS ─────────────────────────────────────────────────
const allowedOrigins = (process.env.CLIENT_URL ?? '').split(',').map(o => o.trim()).filter(Boolean);

const isDev = process.env.NODE_ENV !== 'production';

// In dev: allow ALL localhost/127.0.0.1 ports + local LAN (192.168.x.x)
// In prod: only origins listed in CLIENT_URL are accepted
const isOriginAllowed = (origin: string): boolean =>
  allowedOrigins.includes(origin) ||
  (isDev && (
    /^https?:\/\/localhost(:\d+)?$/.test(origin) ||
    /^https?:\/\/127\.0\.0\.1(:\d+)?$/.test(origin) ||
    /^https?:\/\/192\.168\./.test(origin)
  ));

app.use(cors({
  origin: (origin, callback) => {
    // No origin header — curl/Postman/server-to-server: allow in dev only
    if (!origin) {
      return isDev ? callback(null, true) : callback(null, false);
    }
    if (isOriginAllowed(origin)) {
      return callback(null, true);
    }
    // Return false (block) instead of throwing — avoids hitting globalErrorHandler
    console.warn(`[cors] Blocked origin: ${origin}`);
    callback(null, false);
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  exposedHeaders: ['Content-Disposition'],
}));

// ─── Body Parsing ─────────────────────────────────────────
app.use(express.json({ limit: '5mb' }));           // bumped for form data payloads
app.use(express.urlencoded({ extended: true, limit: '5mb' }));
app.use(cookieParser());

// ─── NoSQL Injection Protection ───────────────────────────
app.use(mongoSanitize());

// ─── Response Compression ─────────────────────────────────
app.use(compression());

// ─── Rate Limiting ────────────────────────────────────────
app.use(globalRateLimiter);

// ─── Routes ───────────────────────────────────────────────
app.use('/api/auth', authRoutes);
app.use('/api/forms', formRoutes);
app.use('/api/pdf', pdfRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/profile', profileRoutes);
app.use('/api/xlit-api-proxy', translitRoutes);

// ─── Health Check ─────────────────────────────────────────
app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString(), env: process.env.NODE_ENV });
});

// ─── 404 Handler ──────────────────────────────────────────
app.use((_req, res) => {
  res.status(404).json({ error: 'Endpoint not found' });
});

// ─── Global Error Handler ─────────────────────────────────
app.use(errorHandler);

// ─── Start Server ─────────────────────────────────────────
const PORT = Number(process.env.PORT) || 5000;
app.listen(PORT, () => {
  console.log(`✅ NRSC SLMS Server — http://localhost:${PORT} [${process.env.NODE_ENV ?? 'development'}]`);
});

export default app;
