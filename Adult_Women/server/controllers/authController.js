import jwt from 'jsonwebtoken';
import { User } from '../models/User.js';
import { CycleLog } from '../models/CycleLog.js';
import { asyncHandler } from '../middleware/asyncHandler.js';
import { ApiError } from '../middleware/error.js';
import { addDays, isValidISODate } from '../utils/dates.js';

const LIFE_STAGES = ['general', 'pcos', 'perimenopause', 'fertility'];
const EMAIL_RE = /^\S+@\S+\.\S+$/;

const signToken = (id) =>
  jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || '30d',
  });

const authResponse = (user, statusCode = 200) => ({
  statusCode,
  payload: {
    success: true,
    token: signToken(user._id),
    user: user.toSafeJSON(),
  },
});

export const register = asyncHandler(async (req, res) => {
  const { name, email, password } = req.body;

  if (!name?.trim() || !email?.trim() || !password) {
    throw new ApiError(422, 'Name, email and password are all required.');
  }
  if (!EMAIL_RE.test(email.trim())) {
    throw new ApiError(422, 'Please enter a valid email address.');
  }
  if (password.length < 8) {
    throw new ApiError(422, 'Your password needs at least 8 characters.');
  }

  const exists = await User.findOne({ email: email.toLowerCase().trim() });
  if (exists) {
    throw new ApiError(409, 'An account with that email already exists.');
  }

  const user = await User.create({
    name: name.trim(),
    email: email.toLowerCase().trim(),
    password,
  });

  const { statusCode, payload } = authResponse(user, 201);
  res.status(statusCode).json(payload);
});

export const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    throw new ApiError(422, 'Please enter your email and password.');
  }

  const user = await User.findOne({ email: email.toLowerCase().trim() }).select('+password');
  if (!user || !(await user.matchPassword(password))) {
    throw new ApiError(401, 'That email and password combination does not match.');
  }

  user.lastLoginAt = new Date();
  await user.save({ validateBeforeSave: false });

  const { payload } = authResponse(user);
  res.json(payload);
});

export const getMe = asyncHandler(async (req, res) => {
  res.json({ success: true, user: req.user.toSafeJSON() });
});

export const completeOnboarding = asyncHandler(async (req, res) => {
  const { lifeStages, goals, cycleProfile, age } = req.body;

  const stages = Array.isArray(lifeStages) ? [...new Set(lifeStages)] : [];
  if (!stages.length || stages.some((stage) => !LIFE_STAGES.includes(stage))) {
    throw new ApiError(422, 'Choose at least one valid life-stage focus.');
  }

  const cleanedGoals = Array.isArray(goals)
    ? [...new Set(goals.map((goal) => String(goal).trim()).filter(Boolean))].slice(0, 12)
    : [];

  if (age !== undefined && age !== null && age !== '') {
    const numericAge = Number(age);
    if (!Number.isFinite(numericAge) || numericAge < 13 || numericAge > 80) {
      throw new ApiError(422, 'Please enter an age between 13 and 80.');
    }
    req.user.age = numericAge;
  }

  req.user.lifeStages = stages;
  req.user.goals = cleanedGoals;

  if (cycleProfile && typeof cycleProfile === 'object') {
    const cycleLength = Number(cycleProfile.averageCycleLength);
    const periodLength = Number(cycleProfile.averagePeriodLength);
    if (Number.isFinite(cycleLength) && cycleLength >= 15 && cycleLength <= 90) {
      req.user.cycleProfile.averageCycleLength = cycleLength;
    }
    if (Number.isFinite(periodLength) && periodLength >= 1 && periodLength <= 15) {
      req.user.cycleProfile.averagePeriodLength = periodLength;
    }
    if (cycleProfile.lastPeriodStart && isValidISODate(cycleProfile.lastPeriodStart)) {
      req.user.cycleProfile.lastPeriodStart = cycleProfile.lastPeriodStart;
    }
  }

  req.user.onboardingComplete = true;
  await req.user.save();

  // Turn the onboarding start date into the first visible period entry.
  const firstStart = req.user.cycleProfile.lastPeriodStart;
  if (firstStart && isValidISODate(firstStart)) {
    const existing = await CycleLog.findOne({
      user: req.user._id,
      startDate: firstStart,
    });
    if (!existing) {
      await CycleLog.create({
        user: req.user._id,
        startDate: firstStart,
        endDate: addDays(firstStart, Math.max(1, Math.round(req.user.cycleProfile.averagePeriodLength)) - 1),
        flow: 'medium',
        notes: 'Added during onboarding.',
      });
    }
  }

  res.json({ success: true, user: req.user.toSafeJSON() });
});

export const updateProfile = asyncHandler(async (req, res) => {
  const { name, age, lifeStages, goals, cycleProfile } = req.body;

  if (name !== undefined) {
    if (!String(name).trim()) throw new ApiError(422, 'Name cannot be empty.');
    req.user.name = String(name).trim().slice(0, 80);
  }

  if (age !== undefined) {
    const numericAge = Number(age);
    if (!Number.isFinite(numericAge) || numericAge < 13 || numericAge > 80) {
      throw new ApiError(422, 'Please enter an age between 13 and 80.');
    }
    req.user.age = numericAge;
  }

  if (lifeStages !== undefined) {
    const stages = Array.isArray(lifeStages) ? [...new Set(lifeStages)] : [];
    if (!stages.length || stages.some((stage) => !LIFE_STAGES.includes(stage))) {
      throw new ApiError(422, 'Choose at least one valid life-stage focus.');
    }
    req.user.lifeStages = stages;
  }

  if (goals !== undefined) {
    req.user.goals = Array.isArray(goals)
      ? [...new Set(goals.map((goal) => String(goal).trim()).filter(Boolean))].slice(0, 12)
      : [];
  }

  if (cycleProfile && typeof cycleProfile === 'object') {
    const cycleLength = Number(cycleProfile.averageCycleLength);
    const periodLength = Number(cycleProfile.averagePeriodLength);
    if (Number.isFinite(cycleLength) && cycleLength >= 15 && cycleLength <= 90) {
      req.user.cycleProfile.averageCycleLength = cycleLength;
    }
    if (Number.isFinite(periodLength) && periodLength >= 1 && periodLength <= 15) {
      req.user.cycleProfile.averagePeriodLength = periodLength;
    }
  }

  await req.user.save();
  res.json({ success: true, user: req.user.toSafeJSON() });
});
