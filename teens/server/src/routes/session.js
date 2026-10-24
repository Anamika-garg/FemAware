import { Router } from 'express';
import { config } from '../config.js';
import {
  AssessmentSession,
  CycleEntry,
  DemoSession,
  LearningProgress,
  SymptomLog,
} from '../models/index.js';
import { asyncHandler } from '../middleware/errors.js';
import {
  cookieOptions,
  createDemoSession,
  findSessionByToken,
  ownership,
  requireSession,
} from '../middleware/session.js';
import { generateDemoData } from '../services/demoData.js';

const router = Router();

const describe = (session) => ({
  dataMode: session.dataMode,
  createdAt: session.createdAt,
  expiresAt: session.expiresAt,
});

async function deleteOwnedData(owner) {
  const results = await Promise.all([
    CycleEntry.deleteMany({ owner }),
    SymptomLog.deleteMany({ owner }),
    AssessmentSession.deleteMany({ owner }),
    LearningProgress.deleteMany({ owner }),
  ]);
  const [cycles, symptoms, assessments, progress] = results.map((r) => r.deletedCount);
  return { cycles, symptoms, assessments, progress };
}

// Start (or resume) an anonymous demo session.
router.post(
  '/',
  asyncHandler(async (req, res) => {
    const existing = await findSessionByToken(req.cookies?.[config.cookieName]);
    if (existing) return res.json({ session: describe(existing), resumed: true });
    const { session, token } = await createDemoSession();
    res.cookie(config.cookieName, token, cookieOptions(session.expiresAt));
    res.status(201).json({ session: describe(session), resumed: false });
  }),
);

router.get(
  '/',
  requireSession,
  asyncHandler(async (req, res) => {
    const owner = req.ownerId;
    const [cycles, symptoms, assessments] = await Promise.all([
      CycleEntry.countDocuments({ owner }),
      SymptomLog.countDocuments({ owner }),
      AssessmentSession.countDocuments({ owner }),
    ]);
    res.json({ session: describe(req.demoSession), counts: { cycles, symptoms, assessments } });
  }),
);

// Replace this session's cycles and symptoms with synthetic demo data.
router.post(
  '/demo-data',
  requireSession,
  asyncHandler(async (req, res) => {
    const owner = req.ownerId;
    const { cycles, symptoms } = generateDemoData();
    await Promise.all([CycleEntry.deleteMany({ owner }), SymptomLog.deleteMany({ owner })]);
    const own = ownership(req);
    const [c, s] = await Promise.all([
      CycleEntry.insertMany(cycles.map((x) => ({ ...x, ...own }))),
      SymptomLog.insertMany(symptoms.map((x) => ({ ...x, ...own }))),
    ]);
    res.status(201).json({ loaded: { cycles: c.length, symptoms: s.length } });
  }),
);

// Delete everything this session owns, then the session itself.
router.delete(
  '/',
  requireSession,
  asyncHandler(async (req, res) => {
    const deleted = await deleteOwnedData(req.ownerId);
    await DemoSession.deleteOne({ _id: req.ownerId });
    res.clearCookie(config.cookieName, { ...cookieOptions(), expires: undefined });
    res.json({ deleted });
  }),
);

export default router;
