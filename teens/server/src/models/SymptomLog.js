import mongoose from 'mongoose';
import { ownedFields, addOwnedIndexes, toPublicJSON } from './ownedFields.js';

export const SYMPTOMS = [
  'cramps',
  'headache',
  'bloating',
  'fatigue',
  'mood_changes',
  'acne',
  'breast_tenderness',
  'back_pain',
  'nausea',
  'cravings',
  'heavy_flow',
  'spotting',
];

const symptomLogSchema = new mongoose.Schema(
  {
    ...ownedFields,
    date: { type: Date, required: [true, 'date is required'] },
    symptoms: {
      type: [{ type: String, enum: SYMPTOMS }],
      validate: {
        validator: (list) => list.length > 0 && new Set(list).size === list.length,
        message: 'Choose at least one symptom, without duplicates',
      },
    },
    severity: {
      type: Number,
      required: [true, 'severity is required'],
      min: [1, 'severity must be between 1 and 5'],
      max: [5, 'severity must be between 1 and 5'],
      validate: { validator: Number.isInteger, message: 'severity must be a whole number' },
    },
    notes: { type: String, trim: true, maxlength: [500, 'notes must be 500 characters or fewer'] },
  },
  { timestamps: true },
);

symptomLogSchema.path('date').validate(function notInFuture(value) {
  return value <= new Date(Date.now() + 86_400_000);
}, 'date cannot be in the future');

symptomLogSchema.index({ owner: 1, date: -1 });
addOwnedIndexes(symptomLogSchema);
toPublicJSON(symptomLogSchema);

export const SymptomLog = mongoose.model('SymptomLog', symptomLogSchema);
