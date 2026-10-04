const { errorResponse } = require('../utils/response');

const notFoundHandler = (req, res, next) => {
  next({ statusCode: 404, message: `Route not found: ${req.method} ${req.originalUrl}` });
};

const errorHandler = (err, req, res, next) => {
  const statusCode = err.statusCode || 500;
  const message = err.message || 'Internal Server Error';

  if (statusCode >= 500) {
    console.error(`[${new Date().toISOString()}] ${message}`);
  }

  res.status(statusCode).json(errorResponse(message, statusCode, err.details || null));
};

module.exports = { notFoundHandler, errorHandler };
