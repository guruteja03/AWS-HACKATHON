class AppError extends Error {
  constructor(message, statusCode = 500, details = null) {
    super(message);
    this.name = 'AppError';
    this.statusCode = statusCode;
    this.details = details;
  }
}

const successResponse = (data, meta = {}) => ({
  success: true,
  data,
  ...(Object.keys(meta).length ? { meta } : {}),
});

const errorResponse = (message, statusCode = 500, details = null) => ({
  success: false,
  error: { message, statusCode, ...(details ? { details } : {}) },
});

module.exports = { AppError, successResponse, errorResponse };
