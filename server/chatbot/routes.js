import { Router } from 'express';
import rateLimit from 'express-rate-limit';
import { protect } from '../middleware/auth.js';
import { deleteChat, getChat, postChatMessage } from './controller.js';

const router = Router();

router.use(protect);

// Chat calls are slower and costlier than ordinary API reads. Keep a separate,
// user-facing limit so one account cannot exhaust the Gemini quota.
const messageLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 30,
  standardHeaders: true,
  legacyHeaders: false,
  // `protect` runs first, so the account is always available here. Limiting by
  // account rather than IP keeps shared networks and school Wi-Fi usable.
  keyGenerator: (req) => String(req.user?._id || 'anonymous'),
  message: {
    success: false,
    message: 'You have sent a lot of messages. Please take a short break and try again.',
  },
});

router.get('/', getChat);
router.post('/messages', messageLimiter, postChatMessage);
router.delete('/', deleteChat);

export default router;
