import { User } from '../models/User.js';
import { CycleLog } from '../models/CycleLog.js';
import { SymptomLog } from '../models/SymptomLog.js';
import { HealthReport } from '../models/HealthReport.js';
import { asyncHandler } from '../middleware/asyncHandler.js';
import { ApiError } from '../middleware/error.js';
import { isValidISODate } from '../utils/dates.js';
import { deleteTeenData, exportTeenData } from '../teen/index.js';

export const exportData = asyncHandler(async (req, res) => {
  const [cycles, symptoms, reports, teen] = await Promise.all([
    CycleLog.find({ user: req.user._id }).sort({ startDate: 1 }).lean(),
    SymptomLog.find({ user: req.user._id }).sort({ date: 1 }).lean(),
    HealthReport.find({ user: req.user._id }).sort({ generatedAt: 1 }).lean(),
    exportTeenData(req.user._id),
  ]);

  const payload = {
    exportVersion: '1.1',
    generatedAt: new Date().toISOString(),
    account: req.user.toSafeJSON(),
    cycles,
    symptoms,
    reports,
    teen,
    notes:
      'This archive contains the health information you entered in FemAware. It is personal data — store it somewhere private.',
  };

  const filename = `femaware-export-${new Date().toISOString().slice(0, 10)}.json`;
  res.setHeader('Content-Type', 'application/json');
  res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
  res.send(JSON.stringify(payload, null, 2));
});

export const deleteData = asyncHandler(async (req, res) => {
  const { scope, startDate, endDate, password, confirmation } = req.body;

  if (!password) {
    throw new ApiError(422, 'Please confirm your password before deleting data.');
  }

  const user = await User.findById(req.user._id).select('+password');
  if (!user || !(await user.matchPassword(password))) {
    throw new ApiError(401, 'That password is not correct.');
  }

  if (scope === 'account') {
    if (confirmation !== 'DELETE') {
      throw new ApiError(422, 'Type DELETE to confirm account deletion.');
    }

    await Promise.all([
      CycleLog.deleteMany({ user: user._id }),
      SymptomLog.deleteMany({ user: user._id }),
      HealthReport.deleteMany({ user: user._id }),
      deleteTeenData(user._id),
    ]);
    await User.deleteOne({ _id: user._id });

    return res.json({
      success: true,
      message: 'Your account and all associated health data have been permanently deleted.',
      deletedAccount: true,
    });
  }

  if (scope === 'all') {
    if (confirmation !== 'DELETE') {
      throw new ApiError(422, 'Type DELETE to confirm clearing all health logs.');
    }

    const [cycles, symptoms, reports, teen] = await Promise.all([
      CycleLog.deleteMany({ user: user._id }),
      SymptomLog.deleteMany({ user: user._id }),
      HealthReport.deleteMany({ user: user._id }),
      deleteTeenData(user._id),
    ]);

    user.cycleProfile.lastPeriodStart = null;
    await user.save({ validateBeforeSave: false });

    return res.json({
      success: true,
      message: 'All health logs have been cleared. Your account is still active.',
      deleted: {
        cycles: cycles.deletedCount + teen.cycles,
        symptoms: symptoms.deletedCount + teen.symptoms,
        reports: reports.deletedCount,
        assessments: teen.assessments,
      },
    });
  }

  if (scope === 'range') {
    if (!isValidISODate(startDate) || !isValidISODate(endDate) || startDate > endDate) {
      throw new ApiError(422, 'Choose a valid date range to delete.');
    }

    const [cycles, symptoms, teen] = await Promise.all([
      CycleLog.deleteMany({
        user: user._id,
        startDate: { $gte: startDate, $lte: endDate },
      }),
      SymptomLog.deleteMany({
        user: user._id,
        date: { $gte: startDate, $lte: endDate },
      }),
      deleteTeenData(user._id, { startDate, endDate }),
    ]);

    const remaining = await CycleLog.findOne({ user: user._id }).sort({ startDate: -1 });
    user.cycleProfile.lastPeriodStart = remaining?.startDate || null;
    await user.save({ validateBeforeSave: false });

    return res.json({
      success: true,
      message: 'The selected date range has been removed.',
      deleted: {
        cycles: cycles.deletedCount + teen.cycles,
        symptoms: symptoms.deletedCount + teen.symptoms,
      },
    });
  }

  throw new ApiError(422, 'Choose a valid deletion option.');
});
