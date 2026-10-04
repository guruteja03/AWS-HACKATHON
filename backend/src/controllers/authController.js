const { z } = require('zod');
const jwt = require('jsonwebtoken');
const { config, isMockMode } = require('../config');
const { successResponse, AppError } = require('../utils/response');

const loginSchema = z.object({
  email: z.string().email('Valid email is required.'),
  password: z.string().min(8, 'Password must be at least 8 characters long.'),
});

// Demo-only identity for this educational app; replace it with Cognito/OIDC before deployment.
const demoLogin = async (req, res, next) => {
  try {
    if (!isMockMode()) {
      return next(new AppError('Demo authentication is only available in mock mode.', 503));
    }
    const parsed = loginSchema.safeParse(req.body);

    if (!parsed.success) {
      const firstError = parsed.error.issues[0]?.message || 'Validation failed';
      return next(new AppError(firstError, 400));
    }

    const { email, password } = parsed.data;
    const demoUser = config.demoCredentials;

    if (email !== demoUser.email || password !== demoUser.password) {
      return next(new AppError('Invalid demo credentials.', 401));
    }

    const token = jwt.sign({ sub: 'demo-user', email }, config.jwtSecret, { expiresIn: '8h' });

    return res.status(200).json(successResponse({
      token,
      user: { email, role: 'admin' },
      message: 'Demo login successful.',
    }));
  } catch (error) {
    next(error);
  }
};

module.exports = { demoLogin };
