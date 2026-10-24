/**
 * Record a clinician sign-off for a lesson or guidance item.
 *
 *   node src/scripts/markReviewed.js --module menstrual-cycle-basics --reviewer "Dr A. Example, MD (Adolescent Gynecology)"
 *   node src/scripts/markReviewed.js --guidance cramps.urgent --reviewer "..."
 *   node src/scripts/markReviewed.js --all-guidance --reviewer "..."
 */
import { parseArgs } from 'node:util';
import { connectDatabase, disconnectDatabase } from '../db.js';
import { GuidanceContent, LearningModule } from '../models/index.js';
import { GUIDANCE_VERSION } from '../guidance/constants.js';

const { values } = parseArgs({
  options: {
    module: { type: 'string' },
    guidance: { type: 'string' },
    'all-guidance': { type: 'boolean' },
    reviewer: { type: 'string' },
  },
});

if (!values.reviewer || !(values.module || values.guidance || values['all-guidance'])) {
  console.error('Usage: --reviewer "<name, credentials>" and one of --module <slug> | --guidance <key> | --all-guidance');
  process.exit(1);
}

const signOff = { reviewStatus: 'clinician_reviewed', reviewedBy: values.reviewer, reviewedAt: new Date() };

try {
  await connectDatabase();
  let result;
  if (values.module) {
    result = await LearningModule.updateOne({ slug: values.module }, { $set: signOff });
  } else if (values.guidance) {
    result = await GuidanceContent.updateOne({ key: values.guidance, version: GUIDANCE_VERSION }, { $set: signOff });
  } else {
    result = await GuidanceContent.updateMany({ version: GUIDANCE_VERSION }, { $set: signOff });
  }
  console.log(`[review] Marked ${result.modifiedCount} item(s) as clinician_reviewed by ${values.reviewer}`);
} finally {
  await disconnectDatabase();
}
