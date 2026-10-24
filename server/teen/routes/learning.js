import { Router } from 'express';
import { servableFilter } from '../config.js';
import { LearningModule, LearningProgress } from '../models/index.js';
import { asyncHandler, HttpError } from '../errors.js';
import { ACHIEVEMENTS, applyAttempt, scoreQuiz } from '../services/quiz.js';

const router = Router();

async function getOrCreateProgress(owner) {
  return LearningProgress.findOneAndUpdate(
    { owner },
    { $setOnInsert: { owner } },
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

// Quizzes are scored on the server so answers never reach the browser early.
router.post(
  '/modules/:slug/quiz',
  asyncHandler(async (req, res) => {
    const module = await LearningModule.findOne({ slug: String(req.params.slug), ...servableFilter() });
    if (!module) throw new HttpError(404, 'Lesson not found');
    const outcome = scoreQuiz(module.quiz, req.body?.answers);

    const total = await LearningModule.countDocuments(servableFilter());
    const progress = await getOrCreateProgress(req.user._id);
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
  asyncHandler(async (req, res) => {
    const [progress, total] = await Promise.all([
      getOrCreateProgress(req.user._id),
      LearningModule.countDocuments(servableFilter()),
    ]);
    res.json({ progress: progressView(progress, total) });
  }),
);

export default router;
