// Mongoose validation errors (e.g., required fields missing)
exports.mongooseValidationHandler = (err, req, res, next) => {
  if (err.name === 'ValidationError') {
    const errors = Object.values(err.errors).map((e) => ({
      field: e.path,
      message: e.message,
    }));
    return res.status(400).json({ msg: 'Validation error', errors });
  }
  next(err);
};

// Mongoose cast errors (e.g., invalid ObjectId)
exports.mongooseCastErrorHandler = (err, req, res, next) => {
  if (err.name === 'CastError') {
    return res.status(400).json({
      msg: `Invalid ${err.path}: ${err.value}`,
    });
  }
  next(err);
};

// Custom error (when using next({ status, msg }))
exports.customErrorHandler = (err, req, res, next) => {
  if (err.status && err.msg) {
    return res.status(err.status).json({ msg: err.msg });
  }
  next(err);
};

// Final catch-all error handler
exports.serverErrorHandler = (err, req, res, next) => {
  console.error('Unexpected error:', err);
  return res.status(500).json({ msg: 'Internal server error' });
};
  