import { Router } from 'express';
import { asyncHandler, assertObjectId, HttpError, pick } from '../middleware/errors.js';
import { ownership, requireSession } from '../middleware/session.js';

/**
 * CRUD router for a session-owned model. Every query is scoped by
 * `owner: req.ownerId`, so another session's ids simply 404.
 */
export function ownedCrudRouter(Model, { fields, sort, dateField, maxList = 500 }) {
  const router = Router();
  router.use(requireSession);

  const findOwned = async (req) => {
    assertObjectId(req.params.id);
    const doc = await Model.findOne({ _id: req.params.id, owner: req.ownerId });
    if (!doc) throw new HttpError(404, 'Not found');
    return doc;
  };

  router.get(
    '/',
    asyncHandler(async (req, res) => {
      const filter = { owner: req.ownerId };
      const { from, to } = req.query;
      if (dateField && (from || to)) {
        filter[dateField] = {};
        for (const [op, value] of [['$gte', from], ['$lte', to]]) {
          if (!value) continue;
          const d = new Date(String(value));
          if (Number.isNaN(d.getTime())) throw new HttpError(400, `Invalid date: ${value}`);
          filter[dateField][op] = d;
        }
      }
      const items = await Model.find(filter).sort(sort).limit(maxList);
      res.json({ items });
    }),
  );

  router.get(
    '/:id',
    asyncHandler(async (req, res) => res.json({ item: await findOwned(req) })),
  );

  router.post(
    '/',
    asyncHandler(async (req, res) => {
      const item = await Model.create({ ...pick(req.body, fields), ...ownership(req) });
      res.status(201).json({ item });
    }),
  );

  router.patch(
    '/:id',
    asyncHandler(async (req, res) => {
      const doc = await findOwned(req);
      doc.set(pick(req.body, fields));
      await doc.save();
      res.json({ item: doc });
    }),
  );

  router.delete(
    '/:id',
    asyncHandler(async (req, res) => {
      const doc = await findOwned(req);
      await doc.deleteOne();
      res.status(204).end();
    }),
  );

  return router;
}
