import { CycleLog, FLOW_LEVELS } from '../models/CycleLog.js';
import { asyncHandler } from '../middleware/asyncHandler.js';
import { ApiError } from '../middleware/error.js';
import { isValidISODate, todayISO } from '../utils/dates.js';
import { buildCycleSeries, computeCycleStats } from '../utils/cycleStats.js';

const validatePeriodPayload = (body, { partial = false } = {}) => {
  const data = {};
  if (body.startDate !== undefined || !partial) {
    if (!isValidISODate(body.startDate)) {
      throw new ApiError(422, 'Please choose a valid period start date.');
    }
    data.startDate = body.startDate;
  }
  if (body.endDate !== undefined) {
    if (body.endDate === null || body.endDate === '') {
      data.endDate = null;
    } else {
      if (!isValidISODate(body.endDate)) {
        throw new ApiError(422, 'Please choose a valid period end date.');
      }
      const start = data.startDate || body.startDate;
      if (start && body.endDate < start) {
        throw new ApiError(422, 'The end date cannot be before the start date.');
      }
      data.endDate = body.endDate;
    }
  }
  if (body.flow !== undefined) {
    if (!FLOW_LEVELS.includes(body.flow)) {
      throw new ApiError(422, 'Choose a valid flow intensity.');
    }
    data.flow = body.flow;
  }
  if (body.notes !== undefined) {
    data.notes = String(body.notes).trim().slice(0, 600);
  }
  return data;
};

/**
 * Keep the user's cached last period start in sync with their actual logs.
 * Recalculating (rather than only moving forward) matters when a user edits
 * or deletes their most recent cycle, so predictions never point at a log
 * that no longer exists.
 */
const syncProfileStart = async (user) => {
  const latest = await CycleLog.findOne({ user: user._id }).sort({ startDate: -1 }).select('startDate');
  const next = latest?.startDate ?? null;
  if ((user.cycleProfile?.lastPeriodStart ?? null) !== next) {
    user.cycleProfile.lastPeriodStart = next;
    await user.save({ validateBeforeSave: false });
  }
};

export const createCycle = asyncHandler(async (req, res) => {
  const data = validatePeriodPayload(req.body);

  const duplicate = await CycleLog.findOne({
    user: req.user._id,
    startDate: data.startDate,
  });
  if (duplicate) {
    throw new ApiError(409, 'You already have a period logged starting on that day.');
  }

  const cycle = await CycleLog.create({ ...data, user: req.user._id });
  await syncProfileStart(req.user);

  res.status(201).json({
    success: true,
    message: 'Period logged. Your predictions have been updated.',
    cycle,
  });
});

export const getCycles = asyncHandler(async (req, res) => {
  const { from, to } = req.query;
  const query = { user: req.user._id };

  if (from || to) {
    query.startDate = {};
    if (from && isValidISODate(from)) query.startDate.$gte = from;
    if (to && isValidISODate(to)) query.startDate.$lte = to;
  }

  const cycles = await CycleLog.find(query).sort({ startDate: -1 });
  const allCycles = from || to
    ? await CycleLog.find({ user: req.user._id }).sort({ startDate: -1 })
    : cycles;

  const stats = computeCycleStats(allCycles, req.user.cycleProfile);
  const series = buildCycleSeries(allCycles, 6);

  res.json({
    success: true,
    cycles,
    stats,
    series,
    today: todayISO(),
  });
});

export const updateCycle = asyncHandler(async (req, res) => {
  const cycle = await CycleLog.findOne({ _id: req.params.id, user: req.user._id });
  if (!cycle) throw new ApiError(404, 'That period entry could not be found.');

  const data = validatePeriodPayload(req.body, { partial: true });

  if (data.startDate && data.startDate !== cycle.startDate) {
    const duplicate = await CycleLog.findOne({
      user: req.user._id,
      startDate: data.startDate,
      _id: { $ne: cycle._id },
    });
    if (duplicate) {
      throw new ApiError(409, 'You already have a period logged starting on that day.');
    }
  }

  const nextStart = data.startDate || cycle.startDate;
  const nextEnd = data.endDate !== undefined ? data.endDate : cycle.endDate;
  if (nextEnd && nextEnd < nextStart) {
    throw new ApiError(422, 'The end date cannot be before the start date.');
  }

  Object.assign(cycle, data);
  await cycle.save();
  await syncProfileStart(req.user);

  res.json({
    success: true,
    message: 'Period entry updated.',
    cycle,
  });
});

export const deleteCycle = asyncHandler(async (req, res) => {
  const cycle = await CycleLog.findOneAndDelete({
    _id: req.params.id,
    user: req.user._id,
  });
  if (!cycle) throw new ApiError(404, 'That period entry could not be found.');

  await syncProfileStart(req.user);

  res.json({ success: true, message: 'Period entry removed.' });
});

/** Lightweight endpoint used by dashboard and insights views. */
export const getCycleSummary = asyncHandler(async (req, res) => {
  const cycles = await CycleLog.find({ user: req.user._id }).sort({ startDate: -1 });
  const stats = computeCycleStats(cycles, req.user.cycleProfile);
  res.json({
    success: true,
    stats,
    series: buildCycleSeries(cycles, 6),
    today: todayISO(),
  });
});
