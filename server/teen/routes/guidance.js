import { Router } from 'express';
import { servableFilter } from '../config.js';
import { GuidanceContent } from '../models/index.js';
import { asyncHandler, HttpError } from '../errors.js';

const router = Router();

/** Latest servable version of a piece of guidance content. */
router.get(
  '/:key',
  asyncHandler(async (req, res) => {
    const item = await GuidanceContent.findOne({ key: String(req.params.key), ...servableFilter() }).sort({ createdAt: -1 });
    if (!item) throw new HttpError(404, 'Guidance not found');
    res.json({ item });
  }),
);

export default router;
