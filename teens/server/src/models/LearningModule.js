import mongoose from 'mongoose';
import { reviewFields, sourceSchemaDefinition, validateReviewed } from './reviewFields.js';

export const TOPICS = ['menstrual_health', 'puberty', 'hygiene', 'consent', 'body_safety', 'wellbeing'];

const quizQuestionSchema = new mongoose.Schema(
  {
    prompt: { type: String, required: true },
    options: {
      type: [String],
      validate: { validator: (o) => o.length >= 2 && o.length <= 5, message: '2-5 options required' },
    },
    correctIndex: { type: Number, required: true, min: 0 },
    explanation: { type: String, required: true },
  },
  { _id: false },
);

quizQuestionSchema.path('correctIndex').validate(function inRange(value) {
  return value < this.options.length;
}, 'correctIndex must point at an option');

const learningModuleSchema = new mongoose.Schema(
  {
    slug: { type: String, required: true, unique: true, match: /^[a-z0-9-]+$/ },
    title: { type: String, required: true, trim: true },
    topic: { type: String, enum: TOPICS, required: true },
    summary: { type: String, required: true },
    icon: { type: String, default: 'BookOpen' },
    order: { type: Number, default: 0 },
    estimatedMinutes: { type: Number, min: 1, max: 60, default: 5 },
    xpReward: { type: Number, min: 0, default: 50 },
    sections: [
      new mongoose.Schema({ heading: String, body: String }, { _id: false }),
    ],
    keyPoints: [String],
    quiz: {
      type: [quizQuestionSchema],
      validate: { validator: (q) => q.length > 0, message: 'A module needs at least one quiz question' },
    },
    sources: [new mongoose.Schema(sourceSchemaDefinition, { _id: false })],
    version: { type: Number, default: 1, min: 1 },
    ...reviewFields,
  },
  { timestamps: true },
);

validateReviewed(learningModuleSchema);
learningModuleSchema.index({ topic: 1, order: 1 });

/** Public view: never ship quiz answers to the browser before submission. */
learningModuleSchema.methods.toPublic = function toPublic({ includeContent = true } = {}) {
  const base = {
    id: this._id.toString(),
    slug: this.slug,
    title: this.title,
    topic: this.topic,
    summary: this.summary,
    icon: this.icon,
    order: this.order,
    estimatedMinutes: this.estimatedMinutes,
    xpReward: this.xpReward,
    questionCount: this.quiz.length,
    reviewStatus: this.reviewStatus,
    version: this.version,
  };
  if (!includeContent) return base;
  return {
    ...base,
    sections: this.sections,
    keyPoints: this.keyPoints,
    sources: this.sources,
    quiz: this.quiz.map((q, index) => ({ index, prompt: q.prompt, options: q.options })),
  };
};

export const LearningModule = mongoose.model('LearningModule', learningModuleSchema);
