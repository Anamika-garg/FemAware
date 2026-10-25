import mongoose from 'mongoose';

export const CHAT_ROLES = ['user', 'assistant'];
export const CHAT_URGENCIES = ['routine', 'soon', 'urgent', 'emergency', 'crisis'];

const chatMessageSchema = new mongoose.Schema(
  {
    role: { type: String, enum: CHAT_ROLES, required: true },
    content: { type: String, required: true, maxlength: 8000 },
    // A short, user-facing rationale. This is not raw chain of thought.
    reasoning: { type: [String], default: [] },
    urgency: { type: String, enum: CHAT_URGENCIES, default: 'routine' },
    followUps: { type: [String], default: [] },
    safetyLevel: {
      type: String,
      enum: ['none', ...CHAT_URGENCIES],
      default: 'none',
    },
    createdAt: { type: Date, default: Date.now },
  },
  { _id: true }
);

const chatThreadSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    module: {
      type: String,
      enum: ['teen', 'adult', 'senior'],
      required: true,
    },
    messages: { type: [chatMessageSchema], default: [] },
    lastMessageAt: { type: Date, default: null },
  },
  { timestamps: true }
);

// One conversation per person per life-stage module. If someone switches from
// adult to senior, they get a fresh thread while the old one stays exportable.
chatThreadSchema.index({ user: 1, module: 1 }, { unique: true });

export const ChatThread = mongoose.model('ChatThread', chatThreadSchema);
