import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import compression from 'compression';
import rateLimit from 'express-rate-limit';
import path from 'node:path';
import fs from 'node:fs';
import { fileURLToPath } from 'node:url';

import apiRoutes from './routes/index.js';
import { notFound, errorHandler } from './middleware/error.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

if (!process.env.JWT_SECRET) {
  if (process.env.NODE_ENV === 'production') {
    throw new Error('JWT_SECRET must be set in production.');
  }
  process.env.JWT_SECRET = 'femaware-local-development-secret';
}

const app = express();
app.disable('x-powered-by');
app.set('trust proxy', 1);

app.use(helmet({ crossOriginResourcePolicy: { policy: 'cross-origin' } }));
app.use(compression());

const PORT = Number(process.env.PORT) || 5000;

const allowedOrigins = new Set([
  ...(process.env.CLIENT_URL || 'http://localhost:5173')
    .split(',')
    .map((origin) => origin.trim())
    .filter(Boolean),
  // The compiled SPA is served by this same server in production, and browsers
  // send an Origin header for ES module requests.
  `http://localhost:${PORT}`,
  `http://127.0.0.1:${PORT}`,
]);

app.use(
  cors({
    origin(origin, callback) {
      if (!origin || allowedOrigins.has(origin)) return callback(null, true);
      // Do not throw: a rejected cross-origin request should simply receive no
      // CORS headers instead of turning into a 500 for every static asset.
      return callback(null, false);
    },
    credentials: true,
  })
);

app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: true, limit: '1mb' }));
if (process.env.NODE_ENV !== 'test') {
  app.use(morgan(process.env.NODE_ENV === 'production' ? 'combined' : 'dev'));
}

const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 500,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, message: 'Too many requests. Please pause for a moment.' },
});

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 40,
  standardHeaders: true,
  legacyHeaders: false,
  // Only failed credential attempts should count toward the limit. Successful
  // sign-ins, profile reads and onboarding must never lock a user out.
  skipSuccessfulRequests: true,
  skip: (req) => req.method === 'GET',
  message: {
    success: false,
    message: 'Too many sign-in attempts. Please wait a few minutes and try again.',
  },
});

app.get('/', (req,res) => {
  res.json({
    success : true
  })
})

app.get('/api/health', (req, res) => {
  res.json({
    success: true,
    service: 'FemAware API',
    status: 'healthy',
    time: new Date().toISOString(),
  });
});

app.use('/api/auth', authLimiter);
app.use('/api', apiLimiter, apiRoutes);

// Serve the compiled React app when the project is deployed as one service.
const clientDist = path.resolve(__dirname, '../client/dist');
if (fs.existsSync(clientDist)) {
  app.use(express.static(clientDist));
  app.get('*', (req, res, next) => {
    if (req.path.startsWith('/api')) return next();
    return res.sendFile(path.join(clientDist, 'index.html'));
  });
}

app.use(notFound);
app.use(errorHandler);

export default app;
