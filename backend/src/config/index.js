const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../../.env') });

const config = {
  port: Number(process.env.PORT || 5000),
  awsRegion: process.env.AWS_REGION || 'eu-north-1',
  corsOrigin: process.env.CORS_ORIGIN || 'http://localhost:5173',
  useMockData: String(process.env.USE_MOCK_DATA || 'true').toLowerCase() === 'true',
  jwtSecret: process.env.JWT_SECRET || 'demo-secret',
  demoCredentials: {
    email: process.env.DEMO_EMAIL || 'admin@example.com',
    password: process.env.DEMO_PASSWORD || 'Admin@123',
  },
};

const isMockMode = () => config.useMockData;

module.exports = { config, isMockMode };
