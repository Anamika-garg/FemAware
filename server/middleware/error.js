export class ApiError extends Error {
  constructor(statusCode, message, errors = null) {
    super(message);
    this.statusCode = statusCode;
    this.errors = errors;
    this.isOperational = true;
    Error.captureStackTrace(this, this.constructor);
  }
}

export const notFound = (req, res, next) => {
  next(new ApiError(404, `We couldn't find ${req.method} ${req.originalUrl}`));
};

export const errorHandler = (err, req, res, next) => {
  if (res.headersSent) return next(err);

  let statusCode = err.statusCode || 500;
  let message = err.message || 'Something went wrong on our end.';
  let errors = err.errors || null;

  if (err.name === 'ValidationError') {
    statusCode = 422;
    message = 'Please check the highlighted fields and try again.';
    errors = Object.values(err.errors).map((item) => ({
      field: item.path,
      message: item.message,
    }));
  }

  if (err.code === 11000) {
    statusCode = 409;
    const field = Object.keys(err.keyPattern || {})[0] || 'value';
    message =
      field === 'email'
        ? 'An account with that email already exists.'
        : 'A log already exists for that date.';
    errors = [{ field, message }];
  }

  if (err.name === 'CastError') {
    statusCode = 400;
    message = 'That record identifier is not valid.';
  }

  if (err.type === 'entity.parse.failed') {
    statusCode = 400;
    message = 'The request contained malformed JSON.';
  }

  if (err.type === 'entity.too.large') {
    statusCode = 413;
    message = 'That request is too large.';
  }

  if (statusCode >= 500) {
    console.error('💥 Unhandled error:', err);
  }

  res.status(statusCode).json({
    success: false,
    message,
    ...(errors ? { errors } : {}),
    ...(process.env.NODE_ENV !== 'production' && statusCode >= 500
      ? { stack: err.stack }
      : {}),
  });
};
