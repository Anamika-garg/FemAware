import { config } from './config.js';
import { createApp } from './app.js';
import { connectDatabase, disconnectDatabase } from './db.js';
import { seedContent } from './scripts/seedContent.js';

await connectDatabase();

if (config.useInMemoryDb) {
  // An in-memory database starts empty, so seed lessons and guidance on boot.
  console.log('[seed]', await seedContent());
}

const server = createApp().listen(config.port, () => {
  console.log(`[api] FemAware API listening on http://localhost:${config.port} (${config.nodeEnv}, data mode: ${config.dataMode})`);
  if (!config.allowUnreviewedGuidance) {
    console.log('[api] Only clinician_reviewed lessons and guidance will be served.');
  }
});

async function shutdown() {
  server.close();
  await disconnectDatabase();
  process.exit(0);
}
process.on('SIGINT', shutdown);
process.on('SIGTERM', shutdown);
