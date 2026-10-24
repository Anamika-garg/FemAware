import express from 'express';
import authRoutes from './authRoutes.js';
import cycleRoutes from './cycleRoutes.js';
import symptomRoutes from './symptomRoutes.js';
import reportRoutes from './reportRoutes.js';
import userRoutes from './userRoutes.js';

const router = express.Router();

router.use('/auth', authRoutes);
router.use('/cycles', cycleRoutes);
router.use('/symptoms', symptomRoutes);
router.use('/reports', reportRoutes);
router.use('/user', userRoutes);

export default router;
