import mongoose from 'mongoose';
import { AnswerValidationError } from '../guidance/rules.js';
import { QuizSubmissionError } from '../services/quiz.js';

export class HttpError extends Error {
  constructor(status, message, details) {
    super(message);
    this.status = status;
    this.details = details;
  }
}

export const asyncHandler = (fn) => (req, res, next) => Promise.resolve(fn(req, res, next)).catch(next);

export function assertObjectId(id) {
  if (!mongoose.isValidObjectId(id)) throw new HttpError(400, 'Invalid id');
}

/** Copy only allow-listed keys from the request body. */
export function pick(body, keys) {
  const out = {};
  for (const key of keys) if (body && Object.hasOwn(body, key)) out[key] = body[key];
  return out;
}

export function notFound(_req, _res, next) {
  next(new HttpError(404, 'Not found'));
}

// eslint-disable-next-line no-unused-vars
export function errorHandler(err, _req, res, _next) {
  if (err instanceof mongoose.Error.ValidationError) {
    const details = Object.fromEntries(Object.entries(err.errors).map(([k, v]) => [k, v.message]));
    return res.status(400).json({ error: 'Validation failed', details });
  }
  if (err instanceof mongoose.Error.CastError) {
    return res.status(400).json({ error: `Invalid value for ${err.path}` });
  }
  if (err instanceof AnswerValidationError) {
    return res.status(400).json({ error: err.message, details: err.errors });
  }
  if (err instanceof QuizSubmissionError) {
    return res.status(400).json({ error: err.message });
  }
  if (err.type === 'entity.parse.failed') {
    return res.status(400).json({ error: 'Malformed JSON' });
  }
  if (err instanceof HttpError) {
    return res.status(err.status).json({ error: err.message, ...(err.details && { details: err.details }) });
  }
  console.error(err);
  res.status(500).json({ error: 'Something went wrong' });
}
