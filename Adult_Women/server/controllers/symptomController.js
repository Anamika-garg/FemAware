import { SymptomLog, MOOD_OPTIONS, SEVERITIES } from '../models/SymptomLog.js';
import { FLOW_LEVELS } from '../models/CycleLog.js';
import { asyncHandler } from '../middleware/asyncHandler.js';
import { ApiError } from '../middleware/error.js';
import { addDays, isValidISODate, todayISO } from '../utils/dates.js';

const normalizeSymptoms = (physical) => {
  if (physical === undefined) return undefined;
  if (!Array.isArray(physical)) {
    throw new ApiError(422, 'Physical symptoms must be a list.');
  }
  if (physical.length > 20) {
    throw new ApiError(422, 'Please choose up to 20 physical symptoms.');
  }

  const seen = new Set();
  return physical
    .map((item) => {
      const name = String(item?.name || '').trim().slice(0, 60);
      const severity = SEVERITIES.includes(item?.severity) ? item.severity : 'mild';
      return { name, severity };
    })
    .filter((item) => {
      if (!item.name || seen.has(item.name)) return false;
      seen.add(item.name);
      return true;
    });
};

const validateSymptomPayload = (body, { partial = false } = {}) => {
  const data = {};

  if (body.date !== undefined || !partial) {
    if (!isValidISODate(body.date)) {
      throw new ApiError(422, 'Please choose a valid date for this log.');
    }
    if (body.date > addDays(todayISO(), 1)) {
      throw new ApiError(422, 'You cannot log symptoms for a future date.');
    }
    data.date = body.date;
  }

  const physical = normalizeSymptoms(body.physical);
  if (physical !== undefined) data.physical = physical;

  if (body.mood !== undefined) {
    if (!Array.isArray(body.mood)) {
      throw new ApiError(422, 'Mood selections must be a list.');
    }
    const invalid = body.mood.find((item) => !MOOD_OPTIONS.includes(item));
    if (invalid) throw new ApiError(422, `"${invalid}" is not a recognized mood option.`);
    data.mood = [...new Set(body.mood)];
  }

  if (body.flow !== undefined) {
    if (!['none', ...FLOW_LEVELS].includes(body.flow)) {
      throw new ApiError(422, 'Choose a valid flow level.');
    }
    data.flow = body.flow;
  }

  if (body.energyLevel !== undefined) {
    const energy = Number(body.energyLevel);
    if (!Number.isInteger(energy) || energy < 1 || energy > 5) {
      throw new ApiError(422, 'Energy level must be between 1 and 5.');
    }
    data.energyLevel = energy;
  }

  if (body.sleepHours !== undefined) {
    if (body.sleepHours === null || body.sleepHours === '') {
      data.sleepHours = null;
    } else {
      const sleep = Number(body.sleepHours);
      if (!Number.isFinite(sleep) || sleep < 0 || sleep > 24) {
        throw new ApiError(422, 'Sleep hours must be between 0 and 24.');
      }
      data.sleepHours = Math.round(sleep * 10) / 10;
    }
  }

  if (body.notes !== undefined) {
    data.notes = String(body.notes).trim().slice(0, 1200);
  }

  return data;
};

export const createOrUpdateSymptom = asyncHandler(async (req, res) => {
  const data = validateSymptomPayload(req.body);

  const existing = await SymptomLog.findOne({
    user: req.user._id,
    date: data.date,
  });

  let log;
  let created = false;
  if (existing) {
    Object.assign(existing, data);
    log = await existing.save();
  } else {
    log = await SymptomLog.create({ ...data, user: req.user._id });
    created = true;
  }

  res.status(created ? 201 : 200).json({
    success: true,
    message: created
      ? 'Today is in your journal. Small logs build real patterns.'
      : 'Your journal entry has been updated.',
    log,
  });
});

export const getSymptoms = asyncHandler(async (req, res) => {
  const { from, to } = req.query;
  const limit = Math.min(Math.max(Number(req.query.limit) || 180, 1), 500);
  const query = { user: req.user._id };

  if (from || to) {
    query.date = {};
    if (from && isValidISODate(from)) query.date.$gte = from;
    if (to && isValidISODate(to)) query.date.$lte = to;
  }

  const logs = await SymptomLog.find(query).sort({ date: -1 }).limit(limit);
  const total = await SymptomLog.countDocuments(query);

  res.json({ success: true, logs, total });
});

export const updateSymptom = asyncHandler(async (req, res) => {
  const log = await SymptomLog.findOne({ _id: req.params.id, user: req.user._id });
  if (!log) throw new ApiError(404, 'That journal entry could not be found.');

  const data = validateSymptomPayload(req.body, { partial: true });

  if (data.date && data.date !== log.date) {
    const duplicate = await SymptomLog.findOne({
      user: req.user._id,
      date: data.date,
      _id: { $ne: log._id },
    });
    if (duplicate) {
      throw new ApiError(409, 'A journal entry already exists for that date. Edit that one instead.');
    }
  }

  Object.assign(log, data);
  await log.save();

  res.json({ success: true, message: 'Journal entry updated.', log });
});

export const deleteSymptom = asyncHandler(async (req, res) => {
  const log = await SymptomLog.findOneAndDelete({
    _id: req.params.id,
    user: req.user._id,
  });
  if (!log) throw new ApiError(404, 'That journal entry could not be found.');

  res.json({ success: true, message: 'Journal entry deleted.' });
});

export const getSymptomSummary = asyncHandler(async (req, res) => {
  const { from, to } = req.query;
  const query = { user: req.user._id };
  if (from || to) {
    query.date = {};
    if (from && isValidISODate(from)) query.date.$gte = from;
    if (to && isValidISODate(to)) query.date.$lte = to;
  }

  const logs = await SymptomLog.find(query).sort({ date: 1 });

  const physical = new Map();
  const mood = new Map();
  const flow = new Map();

  logs.forEach((log) => {
    (log.physical || []).forEach((item) => {
      physical.set(item.name, (physical.get(item.name) || 0) + 1);
    });
    (log.mood || []).forEach((item) => mood.set(item, (mood.get(item) || 0) + 1));
    if (log.flow && log.flow !== 'none') {
      flow.set(log.flow, (flow.get(log.flow) || 0) + 1);
    }
  });

  res.json({
    success: true,
    totalLogs: logs.length,
    topPhysical: [...physical.entries()]
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 8),
    topMood: [...mood.entries()]
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 6),
    flowDistribution: [...flow.entries()].map(([name, count]) => ({ name, count })),
    daily: logs.map((log) => ({
      date: log.date,
      physical: log.physical.length,
      mood: log.mood.length,
      energyLevel: log.energyLevel,
    })),
  });
});
