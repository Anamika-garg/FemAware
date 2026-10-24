import { CycleLog } from '../models/CycleLog.js';
import { SymptomLog } from '../models/SymptomLog.js';
import { HealthReport } from '../models/HealthReport.js';
import { asyncHandler } from '../middleware/asyncHandler.js';
import { ApiError } from '../middleware/error.js';
import { clampRange, isValidISODate } from '../utils/dates.js';
import { buildReportSnapshot } from '../utils/reportBuilder.js';

const gatherData = async (user, from, to) => {
  if ((from && !isValidISODate(from)) || (to && !isValidISODate(to))) {
    throw new ApiError(422, 'Please provide valid report dates.');
  }
  const { start, end } = clampRange(
    from || undefined,
    to || undefined,
    180
  );

  const symptomQueryStart = start;
  const [cycles, symptoms] = await Promise.all([
    CycleLog.find({ user: user._id, startDate: { $lte: end } }).sort({ startDate: 1 }),
    SymptomLog.find({
      user: user._id,
      date: { $gte: symptomQueryStart, $lte: end },
    }).sort({ date: 1 }),
  ]);

  return { start, end, cycles, symptoms };
};

const cleanLines = (value, limit = 15) =>
  Array.isArray(value)
    ? value.map((item) => String(item).trim()).filter(Boolean).slice(0, limit)
    : [];

const cleanText = (value, maxLength = 2000) => String(value || '').trim().slice(0, maxLength);

export const previewReport = asyncHandler(async (req, res) => {
  const { from, to, concerns, medications, visitDate, careContext } = req.body || {};
  const { start, end, cycles, symptoms } = await gatherData(req.user, from, to);
  const snapshot = buildReportSnapshot({
    user: req.user,
    cycles,
    symptoms,
    rangeStart: start,
    rangeEnd: end,
    concerns: cleanLines(concerns),
    medications: cleanLines(medications),
    visitDate: isValidISODate(visitDate) ? visitDate : null,
    careContext: careContext === 'senior' ? 'senior' : null,
  });

  res.json({ success: true, snapshot });
});

export const saveReport = asyncHandler(async (req, res) => {
  const { from, to, questions, notes, title, concerns, medications, visitDate, careContext } =
    req.body;
  const { start, end, cycles, symptoms } = await gatherData(req.user, from, to);
  const cleanConcerns = cleanLines(concerns);
  const cleanMedications = cleanLines(medications);
  const seniorContext = careContext === 'senior';
  const snapshot = buildReportSnapshot({
    user: req.user,
    cycles,
    symptoms,
    rangeStart: start,
    rangeEnd: end,
    concerns: cleanConcerns,
    medications: cleanMedications,
    visitDate: isValidISODate(visitDate) ? visitDate : null,
    careContext: seniorContext ? 'senior' : null,
  });

  const report = await HealthReport.create({
    user: req.user._id,
    title:
      String(title || '').trim().slice(0, 120) ||
      `${seniorContext ? 'Care' : 'Cycle'} summary · ${start} to ${end}`,
    rangeStart: start,
    rangeEnd: end,
    questions: cleanLines(questions),
    notes: cleanText(notes),
    snapshot,
  });

  res.status(201).json({
    success: true,
    message: 'Report saved to your account.',
    report,
  });
});

export const getReports = asyncHandler(async (req, res) => {
  const reports = await HealthReport.find({ user: req.user._id })
    .select('title rangeStart rangeEnd generatedAt createdAt summary')
    .sort({ generatedAt: -1 })
    .limit(30);

  res.json({ success: true, reports });
});

export const getReport = asyncHandler(async (req, res) => {
  const report = await HealthReport.findOne({
    _id: req.params.id,
    user: req.user._id,
  });
  if (!report) throw new ApiError(404, 'That report could not be found.');

  res.json({ success: true, report });
});

export const deleteReport = asyncHandler(async (req, res) => {
  const report = await HealthReport.findOneAndDelete({
    _id: req.params.id,
    user: req.user._id,
  });
  if (!report) throw new ApiError(404, 'That report could not be found.');

  res.json({ success: true, message: 'Saved report deleted.' });
});
