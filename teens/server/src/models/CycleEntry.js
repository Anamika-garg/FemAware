import mongoose from 'mongoose';
import { ownedFields, addOwnedIndexes, toPublicJSON } from './ownedFields.js';

export const FLOW_LEVELS = ['light', 'medium', 'heavy'];
const MAX_PERIOD_DAYS = 15;

const cycleEntrySchema = new mongoose.Schema(
  {
    ...ownedFields,
    startDate: { type: Date, required: [true, 'startDate is required'] },
    endDate: {
      type: Date,
      validate: [
        {
          validator(value) {
            return !value || !this.startDate || value >= this.startDate;
          },
          message: 'endDate cannot be before startDate',
        },
        {
          validator(value) {
            if (!value || !this.startDate) return true;
            const days = (value - this.startDate) / 86_400_000 + 1;
            return days <= MAX_PERIOD_DAYS;
          },
          message: `A period entry cannot be longer than ${MAX_PERIOD_DAYS} days`,
        },
      ],
    },
    flow: { type: String, enum: FLOW_LEVELS },
  },
  { timestamps: true },
);

cycleEntrySchema.path('startDate').validate(function notInFuture(value) {
  // Allow one day of slack for time-zone differences.
  return value <= new Date(Date.now() + 86_400_000);
}, 'startDate cannot be in the future');

cycleEntrySchema.index({ owner: 1, startDate: -1 });
addOwnedIndexes(cycleEntrySchema);
toPublicJSON(cycleEntrySchema);

export const CycleEntry = mongoose.model('CycleEntry', cycleEntrySchema);
