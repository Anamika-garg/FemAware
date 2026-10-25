import mongoose from 'mongoose';

const questionSchema = new mongoose.Schema({
  index: { type: Number, required: true },
  prompt: { type: String, required: true },
  options: [{ type: String, required: true }],
  correctIndex: { type: Number, required: true },
  explanation: { type: String, required: true },
}, { _id: false });

const teenModuleSchema = new mongoose.Schema({
  slug: { type: String, required: true, unique: true, index: true },
  title: { type: String, required: true },
  description: { type: String, default: '' },
  xpReward: { type: Number, default: 50 },
  reviewStatus: { type: String, default: 'approved' },
  questions: [questionSchema],
}, { timestamps: true });

export const TeenModule = mongoose.model('TeenModule', teenModuleSchema);