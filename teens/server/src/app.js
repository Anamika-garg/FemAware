import path from 'node:path';
import express from 'express';
import helmet from 'helmet';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import rateLimit from 'express-rate-limit';
import { config } from './config.js';
import { CycleEntry, SymptomLog } from './models/index.js';
import { errorHandler, notFound } from './middleware/errors.js';
import { requireClientHeader } from './middleware/session.js';
import { ownedCrudRouter } from './routes/ownedCrud.js';
import sessionRoutes from './routes/session.js';
import learningRoutes from './routes/learning.js';
import assessmentRoutes from './routes/assessments.js';
import insightsRoutes from './routes/insights.js';
import guidanceRoutes from './routes/guidance.js';
import { GUIDANCE_VERSION } from './guidance/constants.js';

export function createApp() {
  const app = express();
  app.disable('x-powered-by');
  app.set('trust proxy', 1);
  app.use(helmet());
  app.use(cors({ origin: config.clientOrigin, credentials: true }));
  app.use(express.json({ limit: '20kb' }));
  app.use(cookieParser());

  if (!config.isTest) {
    app.use('/api', rateLimit({ windowMs: 60_000, limit: 120, standardHeaders: 'draft-7', legacyHeaders: false }));
    app.use('/api/session', rateLimit({ windowMs: 60 * 60_000, limit: 30, standardHeaders: 'draft-7', legacyHeaders: false }));
  }

  app.use('/api', requireClientHeader);

  app.get('/api/health', (_req, res) => {
    res.json({
      status: 'ok',
      dataMode: config.dataMode,
      guidanceVersion: GUIDANCE_VERSION,
      unreviewedGuidanceAllowed: config.allowUnreviewedGuidance,
    });
  });

  app.use('/api/session', sessionRoutes);
  app.use('/api/cycles', ownedCrudRouter(CycleEntry, {
    fields: ['startDate', 'endDate', 'flow'],
    sort: { startDate: -1 },
    dateField: 'startDate',
  }));
  app.use('/api/symptoms', ownedCrudRouter(SymptomLog, {
    fields: ['date', 'symptoms', 'severity', 'notes'],
    sort: { date: -1 },
    dateField: 'date',
  }));
  app.use('/api/learning', learningRoutes);
  app.use('/api/assessments', assessmentRoutes);
  app.use('/api/insights', insightsRoutes);
  app.use('/api/guidance', guidanceRoutes);

  app.use('/api', notFound);

  // Single-origin deployment: serve the built React app from the API server.
  if (config.serveClient) {
    app.use(express.static(config.clientDist, { index: false, maxAge: '1h' }));
    app.get('*', (_req, res) => res.sendFile(path.join(config.clientDist, 'index.html')));
  }

  app.use(errorHandler);
  return app;
}
