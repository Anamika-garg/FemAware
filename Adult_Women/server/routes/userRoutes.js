import express from 'express';
import { exportData, deleteData } from '../controllers/userController.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

router.use(protect);

router.get('/export', exportData);
router.delete('/data', deleteData);

export default router;
