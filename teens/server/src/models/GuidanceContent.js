import mongoose from 'mongoose';
import { reviewFields, sourceSchemaDefinition, validateReviewed } from './reviewFields.js';

export const GUIDANCE_CATEGORIES = ['assessment_result', 'reason', 'education', 'safety'];

const guidanceContentSchema = new mongoose.Schema(
  {
    key: { type: String, required: true, match: /^[a-z0-9_.-]+$/ },
    category: { type: String, enum: GUIDANCE_CATEGORIES, required: true },
    version: { type: String, required: true },
    title: { type: String, required: true },
    body: { type: String, required: true },
    actions: [String],
    sources: [new mongoose.Schema(sourceSchemaDefinition, { _id: false })],
    ...reviewFields,
  },
  { timestamps: true },
);

// A key can have many versions; each (key, version) pair is unique.
guidanceContentSchema.index({ key: 1, version: 1 }, { unique: true });
validateReviewed(guidanceContentSchema);

guidanceContentSchema.set('toJSON', {
  versionKey: false,
  transform(_doc, ret) {
    ret.id = ret._id.toString();
    delete ret._id;
    return ret;
  },
});

export const GuidanceContent = mongoose.model('GuidanceContent', guidanceContentSchema);
