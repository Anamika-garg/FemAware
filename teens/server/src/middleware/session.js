import crypto from 'node:crypto';
import { config } from '../config.js';
import { DemoSession } from '../models/index.js';
import { HttpError } from './errors.js';

const hashToken = (token) => crypto.createHash('sha256').update(token).digest('hex');

export function cookieOptions(expires) {
  return {
    httpOnly: true,
    sameSite: 'lax',
    secure: config.isProduction,
    path: '/api',
    expires,
  };
}

export async function createDemoSession() {
  const token = crypto.randomBytes(32).toString('base64url');
  const expiresAt = new Date(Date.now() + config.sessionTtlDays * 86_400_000);
  const session = await DemoSession.create({ tokenHash: hashToken(token), expiresAt });
  return { session, token };
}

export async function findSessionByToken(token) {
  if (typeof token !== 'string' || token.length < 32 || token.length > 128) return null;
  return DemoSession.findOne({ tokenHash: hashToken(token), expiresAt: { $gt: new Date() } });
}

/**
 * Resolves the demo session from the httpOnly cookie. Ownership is derived
 * only from this server-side lookup — any owner/user id sent by the client
 * is ignored.
 */
export async function requireSession(req, _res, next) {
  try {
    const session = await findSessionByToken(req.cookies?.[config.cookieName]);
    if (!session) throw new HttpError(401, 'No active demo session. Start one from the onboarding page.');
    req.demoSession = session;
    req.ownerId = session._id;
    next();
  } catch (err) {
    next(err);
  }
}

/** Attaches the session when present; anonymous requests continue without one. */
export async function optionalSession(req, _res, next) {
  try {
    const session = await findSessionByToken(req.cookies?.[config.cookieName]);
    if (session) {
      req.demoSession = session;
      req.ownerId = session._id;
    }
    next();
  } catch (err) {
    next(err);
  }
}

/** Fields every new owned document gets, always from the session. */
export function ownership(req) {
  return { owner: req.ownerId, expiresAt: req.demoSession.expiresAt };
}

/**
 * CSRF defence: state-changing requests must carry a custom header, which
 * browsers only allow cross-origin after a CORS preflight we don't grant.
 */
export function requireClientHeader(req, _res, next) {
  if (['GET', 'HEAD', 'OPTIONS'].includes(req.method)) return next();
  if (req.get('X-FemAware-Client') !== '1') {
    return next(new HttpError(403, 'Missing X-FemAware-Client header'));
  }
  next();
}
