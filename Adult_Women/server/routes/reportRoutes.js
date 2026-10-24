import express from 'express';
import {
  previewReport,
  saveReport,
  getReports,
  getReport,
  deleteReport,
} from '../controllers/reportController.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

router.use(protect);

router.post('/preview', previewReport);
router.get('/', getReports);
router.post('/', saveReport);
router.get('/:id', getReport);
router.delete('/:id', deleteReport);

export default router;
