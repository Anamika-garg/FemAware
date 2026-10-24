import { Router } from 'express';
import { config } from '../config.js';
import { GuidanceContent } from '../models/index.js';
import { asyncHandler, HttpError } from '../middleware/errors.js';

const router = Router();

/** Latest servable version of a piece of guidance content. */
router.get(
  '/:key',
  asyncHandler(async (req, res) => {
    const filter = { key: String(req.params.key) };
    filter.reviewStatus = config.allowUnreviewedGuidance
      ? { $in: ['pending_clinical_review', 'clinician_reviewed'] }
      : 'clinician_reviewed';
    const item = await GuidanceContent.findOne(filter).sort({ createdAt: -1 });
    if (!item) throw new HttpError(404, 'Guidance not found');
    res.json({ item });
  }),
);

export default router;
