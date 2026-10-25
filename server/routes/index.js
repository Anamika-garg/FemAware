import express from 'express';
import authRoutes from './authRoutes.js';
import cycleRoutes from './cycleRoutes.js';
import symptomRoutes from './symptomRoutes.js';
import reportRoutes from './reportRoutes.js';
import userRoutes from './userRoutes.js';
import chatRoutes from '../chatbot/routes.js';
import teenRoutes from '../teen/index.js';

const router = express.Router();

router.use('/auth', authRoutes);
router.use('/cycles', cycleRoutes);
router.use('/symptoms', symptomRoutes);
router.use('/reports', reportRoutes);
router.use('/user', userRoutes);
// A module-aware health guide (teen, adult or senior) backed by Gemini.
router.use('/chat', chatRoutes);
// The teen module keeps its own models, lessons and guided checks.
router.use('/teen', teenRoutes);

export default router;
