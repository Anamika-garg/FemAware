import { Router } from 'express';
import { protect } from '../middleware/auth.js';
import { LearningProgress, TeenAssessment, TeenCycleEntry, TeenSymptomLog } from './models/index.js';
import { asyncHandler, errorHandler, notFound } from './errors.js';
import { ownedCrudRouter } from './routes/ownedCrud.js';
import learningRoutes from './routes/learning.js';
import assessmentRoutes from './routes/assessments.js';
import insightsRoutes from './routes/insights.js';
import guidanceRoutes from './routes/guidance.js';
import { generateDemoData } from './services/demoData.js';

/** Everything a teen account owns, for export and deletion. */
const OWNED_MODELS = {
  cycles: TeenCycleEntry,
  symptoms: TeenSymptomLog,
  assessments: TeenAssessment,
  progress: LearningProgress,
};

export async function exportTeenData(owner) {
  const entries = await Promise.all(
    Object.entries(OWNED_MODELS).map(async ([key, Model]) => [key, await Model.find({ owner }).lean()]),
  );
  return Object.fromEntries(entries);
}

export async function deleteTeenData(owner, { startDate, endDate } = {}) {
  // A date range only applies to dated logs; lesson progress and checks stay.
  if (startDate && endDate) {
    const range = { $gte: new Date(startDate), $lte: new Date(`${endDate}T23:59:59.999Z`) };
    const [cycles, symptoms] = await Promise.all([
      TeenCycleEntry.deleteMany({ owner, startDate: range }),
      TeenSymptomLog.deleteMany({ owner, date: range }),
    ]);
    return { cycles: cycles.deletedCount, symptoms: symptoms.deletedCount };
  }
  const results = await Promise.all(Object.values(OWNED_MODELS).map((Model) => Model.deleteMany({ owner })));
  return Object.fromEntries(Object.keys(OWNED_MODELS).map((key, i) => [key, results[i].deletedCount]));
}

const router = Router();
router.use(protect);

router.use('/cycles', ownedCrudRouter(TeenCycleEntry, {
  fields: ['startDate', 'endDate', 'flow'],
  sort: { startDate: -1 },
  dateField: 'startDate',
}));
router.use('/symptoms', ownedCrudRouter(TeenSymptomLog, {
  fields: ['date', 'symptoms', 'severity', 'notes'],
  sort: { date: -1 },
  dateField: 'date',
}));
router.use('/learning', learningRoutes);
router.use('/assessments', assessmentRoutes);
router.use('/insights', insightsRoutes);
router.use('/guidance', guidanceRoutes);

// Replace this account's teen cycles and symptoms with sample data to explore.
router.post(
  '/sample-data',
  asyncHandler(async (req, res) => {
    const owner = req.user._id;
    const { cycles, symptoms } = generateDemoData();
    await Promise.all([TeenCycleEntry.deleteMany({ owner }), TeenSymptomLog.deleteMany({ owner })]);
    const [c, s] = await Promise.all([
      TeenCycleEntry.insertMany(cycles.map((x) => ({ ...x, owner }))),
      TeenSymptomLog.insertMany(symptoms.map((x) => ({ ...x, owner }))),
    ]);
    res.status(201).json({ loaded: { cycles: c.length, symptoms: s.length } });
  }),
);

router.use(notFound);
router.use(errorHandler);

export default router;
