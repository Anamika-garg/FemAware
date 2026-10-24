import mongoose from 'mongoose';
import { FLOW_LEVELS } from './CycleLog.js';

export const SEVERITIES = ['mild', 'moderate', 'severe'];
export const MOOD_OPTIONS = [
  'Calm',
  'Anxious',
  'Irritable',
  'Energetic',
  'Low energy',
  'Mood swings',
  'Hopeful',
  'Overwhelmed',
];

// Senior check-ins use a gentler, broader scale that includes "none".
export const SENIOR_LEVELS = ['none', 'mild', 'moderate', 'severe'];

const physicalSymptomSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true, maxlength: 60 },
    severity: {
      type: String,
      enum: SEVERITIES,
      default: 'mild',
    },
  },
  { _id: false }
);

const seniorDetailsSchema = new mongoose.Schema(
  {
    sleepQuality: { type: Number, min: 1, max: 5, default: null },
    nightSweats: { type: String, enum: SENIOR_LEVELS, default: 'none' },
    daytimeExhaustion: { type: String, enum: SENIOR_LEVELS, default: 'none' },
    hotFlashCount: { type: Number, min: 0, max: 30, default: 0 },
    hotFlashSeverity: { type: String, enum: SENIOR_LEVELS, default: 'none' },
    vaginalDryness: { type: String, enum: SENIOR_LEVELS, default: 'none' },
    bladderUrgency: { type: String, enum: SENIOR_LEVELS, default: 'none' },
    pelvicComfort: { type: String, enum: SENIOR_LEVELS, default: 'none' },
    jointStiffness: { type: String, enum: SENIOR_LEVELS, default: 'none' },
    boneDiscomfort: { type: String, enum: SENIOR_LEVELS, default: 'none' },
    memoryClarity: { type: Number, min: 1, max: 5, default: null },
    emotionalWellbeing: { type: Number, min: 1, max: 5, default: null },
    postmenopausalBleeding: { type: Boolean, default: false },
    mobilityNotes: { type: String, trim: true, maxlength: 500, default: '' },
    memoryNotes: { type: String, trim: true, maxlength: 500, default: '' },
  },
  { _id: false }
);

const symptomLogSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    date: {
      type: String,
      required: [true, 'Log date is required'],
      match: [/^\d{4}-\d{2}-\d{2}$/, 'Dates must use YYYY-MM-DD format'],
    },
    physical: { type: [physicalSymptomSchema], default: [] },
    mood: {
      type: [String],
      default: [],
      validate: {
        validator: (items) => items.every((item) => MOOD_OPTIONS.includes(item)),
        message: 'One or more mood options are not recognized',
      },
    },
    flow: {
      type: String,
      enum: ['none', ...FLOW_LEVELS],
      default: 'none',
    },
    energyLevel: { type: Number, min: 1, max: 5, default: 3 },
    sleepHours: { type: Number, min: 0, max: 24, default: null },
    notes: { type: String, trim: true, maxlength: 1200, default: '' },
    // Only present on senior care check-ins. Optional so adult logs stay lean.
    senior: { type: seniorDetailsSchema, default: undefined },
  },
  { timestamps: true }
);

symptomLogSchema.index({ user: 1, date: -1 });
symptomLogSchema.index({ user: 1, date: 1 }, { unique: true });

export const SymptomLog = mongoose.model('SymptomLog', symptomLogSchema);
