import 'dotenv/config';
import { fileURLToPath } from 'node:url';

const env = process.env;

const nodeEnv = env.NODE_ENV || 'development';
const isProduction = nodeEnv === 'production';

export const config = {
  nodeEnv,
  isProduction,
  isTest: nodeEnv === 'test',
  port: Number(env.PORT) || 4000,
  mongoUri: env.MONGODB_URI || 'mongodb://127.0.0.1:27017/femaware_demo',
  useInMemoryDb: env.USE_IN_MEMORY_DB === 'true',
  clientOrigin: env.CLIENT_ORIGIN || 'http://localhost:5173',
  serveClient: env.SERVE_CLIENT === 'true',
  clientDist: env.CLIENT_DIST || fileURLToPath(new URL('../../client/dist', import.meta.url)),
  // "demo" is the only supported mode for the first release. Every
  // user-owned document is stamped with this value so demo records can
  // never be mixed with (or mistaken for) production records.
  dataMode: env.DATA_MODE || 'demo',
  sessionTtlDays: Number(env.SESSION_TTL_DAYS) || 7,
  cookieName: 'fa_sid',
  // Health guidance must be clinician reviewed before it is served in
  // production. Set to true only for staging/demo deployments.
  allowUnreviewedGuidance: env.ALLOW_UNREVIEWED_GUIDANCE
    ? env.ALLOW_UNREVIEWED_GUIDANCE === 'true'
    : !isProduction,
};

if (config.dataMode !== 'demo') {
  throw new Error(
    `DATA_MODE "${config.dataMode}" is not supported. The first release only runs with synthetic demo data (DATA_MODE=demo).`,
  );
}
