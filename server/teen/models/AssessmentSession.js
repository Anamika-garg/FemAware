import mongoose from 'mongoose';
import { ownedFields, toPublicJSON } from './ownedFields.js';
import { ASSESSMENT_TYPES, GUIDANCE_LEVELS } from '../guidance/constants.js';

/**
 * Stores the minimum necessary result of a guided assessment.
 * Raw answers are evaluated in memory and never persisted; sensitive
 * reason codes (e.g. possible pregnancy) are filtered out before saving.
 */
const assessmentSessionSchema = new mongoose.Schema(
  {
    ...ownedFields,
    type: { type: String, enum: ASSESSMENT_TYPES, required: true },
    guidanceVersion: { type: String, required: true },
    result: {
      level: { type: String, enum: GUIDANCE_LEVELS, required: true },
      reasonCodes: { type: [String], default: [] },
    },
  },
  { timestamps: true },
);

assessmentSessionSchema.index({ owner: 1, createdAt: -1 });
toPublicJSON(assessmentSessionSchema);

export const TeenAssessment = mongoose.model('TeenAssessment', assessmentSessionSchema, 'teen_assessments');
