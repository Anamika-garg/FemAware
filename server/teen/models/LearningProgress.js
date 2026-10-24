import mongoose from 'mongoose';
import { ownedFields, toPublicJSON } from './ownedFields.js';

const completedModuleSchema = new mongoose.Schema(
  {
    module: { type: mongoose.Schema.Types.ObjectId, ref: 'LearningModule', required: true },
    slug: { type: String, required: true },
    bestScore: { type: Number, min: 0, max: 100, required: true },
    lastScore: { type: Number, min: 0, max: 100, required: true },
    attempts: { type: Number, min: 1, default: 1 },
    completedAt: { type: Date, default: Date.now },
  },
  { _id: false },
);

const learningProgressSchema = new mongoose.Schema(
  {
    ...ownedFields,
    // Replaces the shared non-unique owner index with the unique one below.
    owner: { ...ownedFields.owner, index: false },
    completedModules: [completedModuleSchema],
    xp: { type: Number, min: 0, default: 0 },
    achievements: [
      new mongoose.Schema(
        { code: { type: String, required: true }, earnedAt: { type: Date, default: Date.now } },
        { _id: false },
      ),
    ],
  },
  { timestamps: true },
);

// Exactly one progress record per account.
learningProgressSchema.index({ owner: 1 }, { unique: true });
toPublicJSON(learningProgressSchema);

export const LearningProgress = mongoose.model('LearningProgress', learningProgressSchema, 'teen_learning_progress');
