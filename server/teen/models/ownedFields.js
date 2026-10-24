import mongoose from 'mongoose';

/**
 * Fields shared by every teen document that belongs to an account.
 *
 * `owner` is always set server-side from the signed-in user, never from the
 * request body, and can never be reassigned afterwards.
 */
export const ownedFields = {
  owner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true,
    immutable: true,
  },
};

/** Strip internal fields from API output. */
export function toPublicJSON(schema) {
  schema.set('toJSON', {
    versionKey: false,
    transform(_doc, ret) {
      ret.id = ret._id.toString();
      delete ret._id;
      delete ret.owner;
      return ret;
    },
  });
}
