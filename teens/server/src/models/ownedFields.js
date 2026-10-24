import mongoose from 'mongoose';
import { config } from '../config.js';

/**
 * Fields shared by every user-owned document.
 *
 * - `owner` is always set server-side from the authenticated demo session,
 *   never from the request body.
 * - `dataMode` tags the record as demo data so it stays separate from any
 *   future production data.
 * - `expiresAt` lets MongoDB's TTL monitor purge demo data automatically.
 */
export const ownedFields = {
  owner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'DemoSession',
    required: true,
    index: true,
    immutable: true,
  },
  dataMode: {
    type: String,
    enum: ['demo'],
    default: () => config.dataMode,
    immutable: true,
  },
  expiresAt: {
    type: Date,
    required: true,
  },
};

export function addOwnedIndexes(schema) {
  schema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });
}

/** Strip internal fields from API output. */
export function toPublicJSON(schema) {
  schema.set('toJSON', {
    versionKey: false,
    transform(_doc, ret) {
      ret.id = ret._id.toString();
      delete ret._id;
      delete ret.owner;
      delete ret.expiresAt;
      return ret;
    },
  });
}
