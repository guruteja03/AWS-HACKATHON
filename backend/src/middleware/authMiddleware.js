const jwt = require('jsonwebtoken');
const { config } = require('../config');
const { AppError } = require('../utils/response');

const authMiddleware = (req, res, next) => {
  const authHeader = req.headers.authorization || '';
  const token = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : null;

  if (req.path.startsWith('/api/auth')) {
    return next();
  }

  if (!token) {
    return next(new AppError('Authentication required.', 401));
  }

  try {
    const payload = jwt.verify(token, config.jwtSecret);
    if (payload.sub !== 'demo-user' || payload.email !== config.demoCredentials.email) {
      return next(new AppError('Invalid authentication token.', 401));
    }
    req.user = { id: payload.sub, email: payload.email };
    return next();
  } catch {
    return next(new AppError('Invalid or expired authentication token.', 401));
  }
};

module.exports = { authMiddleware };
