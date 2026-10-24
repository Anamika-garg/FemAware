import { connectDatabase, disconnectDatabase } from '../db.js';
import { seedContent } from './seedContent.js';

// Seeds shared educational content only. Personal demo data is created per
// session via POST /api/session/demo-data, never by this script.
try {
  await connectDatabase();
  const result = await seedContent();
  console.log('[seed] Content seeded:', result);
  console.log('[seed] All new content is marked pending_clinical_review.');
} catch (err) {
  console.error('[seed] Failed:', err);
  process.exitCode = 1;
} finally {
  await disconnectDatabase();
}
