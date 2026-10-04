const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const { config, isMockMode } = require('./src/config');
const { notFoundHandler, errorHandler } = require('./src/middleware/errorHandler');
const { authMiddleware } = require('./src/middleware/authMiddleware');
const { AppError } = require('./src/utils/response');
const router = require('./src/routes');

const app = express();

app.use(cors({ origin: config.corsOrigin.split(',').map((origin) => origin.trim()), credentials: true }));
app.use(helmet({ crossOriginResourcePolicy: false }));
app.use(express.json({ limit: '1mb' }));
app.use(morgan('dev'));

const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    error: {
      message: 'Too many login attempts. Please wait 15 minutes before trying again.',
      statusCode: 429,
    },
  },
});

app.get('/api/health', (req, res) => {
  res.json({
    success: true,
    data: {
      status: 'ok',
      mode: isMockMode() ? 'mock' : 'live',
      uptime: process.uptime(),
      timestamp: new Date().toISOString(),
    },
  });
});

app.use('/api/auth', loginLimiter, require('./src/routes/authRoutes'));
app.use('/api', authMiddleware, (req, res, next) => {
  if (!isMockMode()) {
    const hasCredentials = Boolean(process.env.AWS_ACCESS_KEY_ID && process.env.AWS_SECRET_ACCESS_KEY);
    return next(new AppError(
      hasCredentials
        ? 'Live AWS integration is not configured yet. Implement an AWS service client before enabling live mode.'
        : 'Live mode requires AWS credentials. Configure AWS_ACCESS_KEY_ID and AWS_SECRET_ACCESS_KEY or enable USE_MOCK_DATA.',
      503,
    ));
  }
  return next();
}, router);

app.use(notFoundHandler);
app.use(errorHandler);

if (require.main === module) {
  const port = config.port;
  app.listen(port, () => {
    console.log(`CloudShare Manager backend running on http://localhost:${port} (mock=${isMockMode()})`);
  });
}

module.exports = app;
