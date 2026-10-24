import { Router } from 'express';
import { servableFilter } from '../config.js';
import { GuidanceContent, TeenAssessment } from '../models/index.js';
import { asyncHandler, assertObjectId, HttpError } from '../errors.js';
import { ASSESSMENT_TYPES, GUIDANCE_VERSION } from '../guidance/constants.js';
import { getQuestions } from '../guidance/questions.js';
import { evaluate, storableReasonCodes } from '../guidance/rules.js';

const router = Router();

function assertType(type) {
  if (!ASSESSMENT_TYPES.includes(type)) throw new HttpError(400, `type must be one of: ${ASSESSMENT_TYPES.join(', ')}`);
}

async function loadGuidance(type, level, reasonCodes) {
  const filter = { version: GUIDANCE_VERSION, ...servableFilter() };
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

router.post(
  '/',
  asyncHandler(async (req, res) => {
    const { type, answers } = req.body || {};
    assertType(type);
    const outcome = evaluate(type, answers);
    const guidance = await loadGuidance(type, outcome.level, outcome.reasonCodes);

    const saved = await TeenAssessment.create({
      owner: req.user._id,
      type,
      guidanceVersion: GUIDANCE_VERSION,
      result: { level: outcome.level, reasonCodes: storableReasonCodes(outcome.reasonCodes) },
    });
    // The full outcome is returned once; only the minimal record is stored.
    res.status(201).json({ item: saved, saved: true, level: outcome.level, guidance });
  }),
);

router.get(
  '/',
  asyncHandler(async (req, res) => {
    const items = await TeenAssessment.find({ owner: req.user._id }).sort({ createdAt: -1 }).limit(50);
    res.json({ items });
  }),
);

router.delete(
  '/:id',
  asyncHandler(async (req, res) => {
    assertObjectId(req.params.id);
    const { deletedCount } = await TeenAssessment.deleteOne({ _id: req.params.id, owner: req.user._id });
    if (!deletedCount) throw new HttpError(404, 'Not found');
    res.status(204).end();
  }),
);

export default router;
