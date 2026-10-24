import { Router } from 'express';
import { config } from '../config.js';
import { AssessmentSession, GuidanceContent } from '../models/index.js';
import { asyncHandler, assertObjectId, HttpError } from '../middleware/errors.js';
import { optionalSession, ownership, requireSession } from '../middleware/session.js';
import { ASSESSMENT_TYPES, GUIDANCE_VERSION } from '../guidance/constants.js';
import { getQuestions } from '../guidance/questions.js';
import { evaluate, storableReasonCodes } from '../guidance/rules.js';

const router = Router();

function reviewFilter() {
  return config.allowUnreviewedGuidance
    ? { reviewStatus: { $in: ['pending_clinical_review', 'clinician_reviewed'] } }
    : { reviewStatus: 'clinician_reviewed' };
}

function assertType(type) {
  if (!ASSESSMENT_TYPES.includes(type)) throw new HttpError(400, `type must be one of: ${ASSESSMENT_TYPES.join(', ')}`);
}

async function loadGuidance(type, level, reasonCodes) {
  const filter = { version: GUIDANCE_VERSION, ...reviewFilter() };
  const [main, reasons] = await Promise.all([
    GuidanceContent.findOne({ key: `${type}.${level}`, ...filter }),
    GuidanceContent.find({ key: { $in: reasonCodes.map((c) => `reason.${c}`) }, ...filter }),
  ]);
  if (!main) {
    throw new HttpError(
      503,
      'Guidance for this check is not available yet (it may be awaiting clinical review). If you feel unwell, talk to a trusted adult or doctor.',
    );
  }
  const byKey = new Map(reasons.map((r) => [r.key, r.body]));
  return {
    title: main.title,
    body: main.body,
    actions: main.actions,
    sources: main.sources,
    reviewStatus: main.reviewStatus,
    reasons: reasonCodes.map((code) => ({ code, text: byKey.get(`reason.${code}`) || null })),
  };
}

router.get('/questions/:type', (req, res) => {
  assertType(req.params.type);
  res.json({ type: req.params.type, guidanceVersion: GUIDANCE_VERSION, questions: getQuestions(req.params.type) });
});

// Guidance is available to everyone (help should never sit behind onboarding);
// a minimal result is saved only when a demo session exists.
router.post(
  '/',
  optionalSession,
  asyncHandler(async (req, res) => {
    const { type, answers } = req.body || {};
    assertType(type);
    const outcome = evaluate(type, answers);
    const guidance = await loadGuidance(type, outcome.level, outcome.reasonCodes);
    if (!req.demoSession) return res.json({ item: null, saved: false, level: outcome.level, guidance });

    const saved = await AssessmentSession.create({
      ...ownership(req),
      type,
      guidanceVersion: GUIDANCE_VERSION,
      result: { level: outcome.level, reasonCodes: storableReasonCodes(outcome.reasonCodes) },
    });
    // The full outcome is returned once; only the minimal record is stored.
    res.status(201).json({ item: saved, saved: true, level: outcome.level, guidance });
  }),
);

router.use(requireSession);

router.get(
  '/',
  asyncHandler(async (req, res) => {
    const items = await AssessmentSession.find({ owner: req.ownerId }).sort({ createdAt: -1 }).limit(50);
    res.json({ items });
  }),
);

router.delete(
  '/:id',
  asyncHandler(async (req, res) => {
    assertObjectId(req.params.id);
    const { deletedCount } = await AssessmentSession.deleteOne({ _id: req.params.id, owner: req.ownerId });
    if (!deletedCount) throw new HttpError(404, 'Not found');
    res.status(204).end();
  }),
);

export default router;
