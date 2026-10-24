import mongoose from 'mongoose';

/**
 * Anonymous demo session. There is no login: the browser holds a random
 * token in an httpOnly cookie, and only its SHA-256 hash is stored here.
 * The session's ObjectId is the owner of every record the visitor creates.
 */
const demoSessionSchema = new mongoose.Schema(
  {
    tokenHash: { type: String, required: true, unique: true },
    dataMode: { type: String, enum: ['demo'], default: 'demo', immutable: true },
    expiresAt: { type: Date, required: true },
  },
  { timestamps: true },
);

demoSessionSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

export const DemoSession = mongoose.model('DemoSession', demoSessionSchema);
