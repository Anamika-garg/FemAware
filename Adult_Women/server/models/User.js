import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const cycleProfileSchema = new mongoose.Schema(
  {
    averageCycleLength: { type: Number, min: 15, max: 90, default: 28 },
    averagePeriodLength: { type: Number, min: 1, max: 15, default: 5 },
    lastPeriodStart: { type: String, default: null },
  },
  { _id: false }
);

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Name is required'],
      trim: true,
      maxlength: [80, 'Name cannot exceed 80 characters'],
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      lowercase: true,
      trim: true,
      match: [/^\S+@\S+\.\S+$/, 'Please provide a valid email address'],
    },
    password: {
      type: String,
      required: [true, 'Password is required'],
      minlength: [8, 'Password must be at least 8 characters'],
      select: false,
    },
    age: { type: Number, min: 13, max: 80, default: null },
    lifeStages: {
      type: [String],
      enum: ['general', 'pcos', 'perimenopause', 'fertility'],
      default: ['general'],
    },
    goals: {
      type: [String],
      default: [],
    },
    cycleProfile: { type: cycleProfileSchema, default: () => ({}) },
    onboardingComplete: { type: Boolean, default: false },
    clinicianQuestions: { type: [String], default: [] },
    lastLoginAt: { type: Date, default: null },
  },
  { timestamps: true }
);

userSchema.pre('save', async function hashPassword(next) {
  if (!this.isModified('password')) return next();
  const salt = await bcrypt.genSalt(12);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

userSchema.methods.matchPassword = function matchPassword(enteredPassword) {
  return bcrypt.compare(enteredPassword, this.password);
};

userSchema.methods.toSafeJSON = function toSafeJSON() {
  const obj = this.toObject({ virtuals: true });
  delete obj.password;
  delete obj.__v;
  return obj;
};

export const User = mongoose.model('User', userSchema);
