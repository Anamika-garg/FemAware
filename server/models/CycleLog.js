import mongoose from 'mongoose';

export const FLOW_LEVELS = ['spotting', 'light', 'medium', 'heavy'];

const cycleLogSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    startDate: {
      type: String,
      required: [true, 'Period start date is required'],
      match: [/^\d{4}-\d{2}-\d{2}$/, 'Dates must use YYYY-MM-DD format'],
    },
    endDate: {
      type: String,
      default: null,
      match: [/^\d{4}-\d{2}-\d{2}$|^$/, 'Dates must use YYYY-MM-DD format'],
    },
    flow: {
      type: String,
      enum: FLOW_LEVELS,
      default: 'medium',
    },
    notes: { type: String, trim: true, maxlength: 600, default: '' },
  },
  { timestamps: true }
);

cycleLogSchema.index({ user: 1, startDate: -1 });
cycleLogSchema.index({ user: 1, startDate: 1 }, { unique: true });

cycleLogSchema.pre('validate', function validateRange(next) {
  if (this.endDate && this.endDate < this.startDate) {
    this.invalidate('endDate', 'End date cannot be before the start date');
  }
  next();
});

export const CycleLog = mongoose.model('CycleLog', cycleLogSchema);
