import jwt from 'jsonwebtoken';
import { User } from '../models/User.js';
import { ApiError } from './error.js';
import { asyncHandler } from './asyncHandler.js';

export const protect = asyncHandler(async (req, res, next) => {
  const header = req.headers.authorization;
  if (!header?.startsWith('Bearer ')) {
    throw new ApiError(401, 'Please sign in to continue.');
  }

  const token = header.split(' ')[1];
  let decoded;
  try {
    decoded = jwt.verify(token, process.env.JWT_SECRET);
  } catch (error) {
    throw new ApiError(401, 'Your session has expired. Please sign in again.');
  }

  const user = await User.findById(decoded.id);
  if (!user) {
    throw new ApiError(401, 'This account is no longer available.');
  }

  req.user = user;
  next();
});

/** Prevent one account from reading or editing another account's health data. */
export const requireSelf = (paramName = 'userId') =>
  asyncHandler(async (req, res, next) => {
    if (String(req.user._id) !== String(req.params[paramName])) {
      throw new ApiError(403, 'You can only access your own health data.');
    }
    next();
  });
