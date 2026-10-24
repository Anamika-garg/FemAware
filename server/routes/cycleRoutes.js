import express from 'express';
import {
  createCycle,
  getCycles,
  getCycleSummary,
  updateCycle,
  deleteCycle,
} from '../controllers/cycleController.js';
import { protect, requireSelf } from '../middleware/auth.js';

const router = express.Router();

router.use(protect);

router.post('/', createCycle);
router.get('/:userId/summary', requireSelf(), getCycleSummary);
router.get('/:userId', requireSelf(), getCycles);
router.put('/:id', updateCycle);
router.delete('/:id', deleteCycle);

export default router;
