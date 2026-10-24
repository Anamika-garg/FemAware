import { Router } from 'express';
import { AssessmentSession, CycleEntry, SymptomLog } from '../models/index.js';
import { asyncHandler } from '../middleware/errors.js';
import { requireSession } from '../middleware/session.js';
import { buildInsights, renderSummary } from '../services/insights.js';

const router = Router();
router.use(requireSession);

async function loadInsights(owner) {
  const [cycles, logs] = await Promise.all([
    CycleEntry.find({ owner }).sort({ startDate: 1 }).lean(),
    SymptomLog.find({ owner }).sort({ date: 1 }).lean(),
  ]);
  return buildInsights(cycles, logs);
}

router.get(
  '/',
  asyncHandler(async (req, res) => {
    res.json({ insights: await loadInsights(req.ownerId) });
  }),
);

router.get(
  '/summary',
  asyncHandler(async (req, res) => {
    const [insights, assessments] = await Promise.all([
      loadInsights(req.ownerId),
      AssessmentSession.find({ owner: req.ownerId }).sort({ createdAt: -1 }).limit(5).lean(),
    ]);
    const stamp = new Date().toISOString().slice(0, 10);
    res.set('Content-Type', 'text/plain; charset=utf-8');
    res.set('Content-Disposition', `attachment; filename="femaware-summary-${stamp}.txt"`);
    res.send(renderSummary(insights, assessments));
  }),
);

export default router;
