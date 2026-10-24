import { Router } from 'express';
import { config } from '../config.js';
import { LearningModule, LearningProgress } from '../models/index.js';
import { asyncHandler, HttpError } from '../middleware/errors.js';
import { optionalSession, requireSession } from '../middleware/session.js';
import { ACHIEVEMENTS, applyAttempt, scoreQuiz } from '../services/quiz.js';

const router = Router();

/** Production only serves clinician-reviewed lessons. */
function servableFilter() {
  return config.allowUnreviewedGuidance
    ? { reviewStatus: { $in: ['pending_clinical_review', 'clinician_reviewed'] } }
    : { reviewStatus: 'clinician_reviewed' };
}

async function getOrCreateProgress(req) {
  return LearningProgress.findOneAndUpdate(
    { owner: req.ownerId },
    { $setOnInsert: { owner: req.ownerId, expiresAt: req.demoSession.expiresAt } },
    { upsert: true, new: true, setDefaultsOnInsert: true },
  );
}

function progressView(progress, totalModules) {
  return {
    xp: progress.xp,
    level: Math.floor(progress.xp / 150) + 1,
    completedModules: progress.completedModules.map((m) => ({
      slug: m.slug,
      bestScore: m.bestScore,
      lastScore: m.lastScore,
      attempts: m.attempts,
      completedAt: m.completedAt,
    })),
    totalModules,
    achievements: progress.achievements.map((a) => ({ code: a.code, earnedAt: a.earnedAt, ...ACHIEVEMENTS[a.code] })),
    availableAchievements: Object.entries(ACHIEVEMENTS).map(([code, a]) => ({ code, ...a })),
  };
}

// Public: lessons are readable without any session.
router.get(
  '/modules',
  asyncHandler(async (_req, res) => {
    const modules = await LearningModule.find(servableFilter()).sort({ order: 1 });
    res.json({ items: modules.map((m) => m.toPublic({ includeContent: false })) });
  }),
);

router.get(
  '/modules/:slug',
  asyncHandler(async (req, res) => {
    const module = await LearningModule.findOne({ slug: String(req.params.slug), ...servableFilter() });
    if (!module) throw new HttpError(404, 'Lesson not found');
    res.json({ item: module.toPublic() });
  }),
);

// Scoring is public so anyone can learn; progress is saved only with a session.
router.post(
  '/modules/:slug/quiz',
  optionalSession,
  asyncHandler(async (req, res) => {
    const module = await LearningModule.findOne({ slug: String(req.params.slug), ...servableFilter() });
    if (!module) throw new HttpError(404, 'Lesson not found');
    const outcome = scoreQuiz(module.quiz, req.body?.answers);
    if (!req.demoSession) return res.json({ ...outcome, saved: false });

    const total = await LearningModule.countDocuments(servableFilter());
    const progress = await getOrCreateProgress(req);
    const { xpGained, newAchievements } = applyAttempt(progress, module, outcome, total);
    await progress.save();
    res.json({
      ...outcome,
      saved: true,
      xpGained,
      newAchievements: newAchievements.map((code) => ({ code, ...ACHIEVEMENTS[code] })),
      progress: progressView(progress, total),
    });
  }),
);

router.get(
  '/progress',
  requireSession,
  asyncHandler(async (req, res) => {
    const [progress, total] = await Promise.all([
      getOrCreateProgress(req),
      LearningModule.countDocuments(servableFilter()),
    ]);
    res.json({ progress: progressView(progress, total) });
  }),
);

export default router;
