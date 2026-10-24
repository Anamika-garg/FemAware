import express from 'express';
import {
  createOrUpdateSymptom,
  getSymptoms,
  getSymptomSummary,
  updateSymptom,
  deleteSymptom,
} from '../controllers/symptomController.js';
import { protect, requireSelf } from '../middleware/auth.js';

const router = express.Router();

router.use(protect);

router.post('/', createOrUpdateSymptom);
router.get('/:userId/summary', requireSelf(), getSymptomSummary);
router.get('/:userId', requireSelf(), getSymptoms);
router.put('/:id', updateSymptom);
router.delete('/:id', deleteSymptom);

export default router;
