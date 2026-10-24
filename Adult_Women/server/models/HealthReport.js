import mongoose from 'mongoose';

const healthReportSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    title: {
      type: String,
      trim: true,
      default: 'Cycle health summary',
      maxlength: 120,
    },
    rangeStart: {
      type: String,
      required: true,
      match: [/^\d{4}-\d{2}-\d{2}$/, 'Dates must use YYYY-MM-DD format'],
    },
    rangeEnd: {
      type: String,
      required: true,
      match: [/^\d{4}-\d{2}-\d{2}$/, 'Dates must use YYYY-MM-DD format'],
    },
    questions: { type: [String], default: [] },
    notes: { type: String, trim: true, maxlength: 2000, default: '' },
    snapshot: { type: mongoose.Schema.Types.Mixed, required: true },
    generatedAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

healthReportSchema.index({ user: 1, generatedAt: -1 });

export const HealthReport = mongoose.model('HealthReport', healthReportSchema);
