import { GuidanceContent, LearningModule } from '../models/index.js';
import { LEARNING_MODULES } from '../content/learningModules.js';
import { buildGuidanceSeed } from '../content/guidanceContent.js';

/** JSON with sorted keys, so field order never counts as a content change. */
function canonical(value) {
  if (Array.isArray(value)) return `[${value.map(canonical).join(',')}]`;
  if (value && typeof value === 'object' && !(value instanceof Date)) {
    return `{${Object.keys(value).sort().map((k) => `${k}:${canonical(value[k])}`).join(',')}}`;
  }
  return JSON.stringify(value);
}

/**
 * Insert new content as pending review. If existing content changed, reset
 * its review status — a clinician sign-off only covers the exact text
 * they reviewed. Unchanged content keeps its current review status.
 */
async function upsertReviewed(Model, filter, data, { bumpVersion = false } = {}) {
  const existing = await Model.findOne(filter);
  if (!existing) {
    await Model.create({ ...data, reviewStatus: 'pending_clinical_review' });
    return 'created';
  }
  const current = existing.toObject({ depopulate: true, versionKey: false });
  const changed = Object.keys(data).some((k) => canonical(current[k]) !== canonical(data[k]));
  if (!changed) return 'unchanged';
  existing.set(data);
  existing.reviewStatus = 'pending_clinical_review';
  existing.reviewedBy = undefined;
  existing.reviewedAt = undefined;
  if (bumpVersion) existing.version += 1;
  await existing.save();
  return 'updated';
}

export async function seedContent() {
  const tally = { created: 0, updated: 0, unchanged: 0 };
  for (const module of LEARNING_MODULES) {
    tally[await upsertReviewed(LearningModule, { slug: module.slug }, module, { bumpVersion: true })] += 1;
  }
  const guidance = buildGuidanceSeed();
  for (const item of guidance) {
    const { reviewStatus: _ignored, ...content } = item;
    tally[await upsertReviewed(GuidanceContent, { key: item.key, version: item.version }, content)] += 1;
  }
  return { modules: LEARNING_MODULES.length, guidance: guidance.length, ...tally };
}
