const path = require('path');
const fs = require('fs');

const backendEnv = path.resolve(__dirname, '../../.env');
const rootEnv = path.resolve(__dirname, '../../../.env');
if (fs.existsSync(backendEnv)) {
  require('dotenv').config({ path: backendEnv });
} else if (fs.existsSync(rootEnv)) {
  require('dotenv').config({ path: rootEnv });
} else {
  require('dotenv').config();
}

module.exports = {
  PORT: process.env.BACKEND_PORT || (process.env.PORT && process.env.PORT !== '8080' ? process.env.PORT : 4000),
  NODE_ENV: process.env.NODE_ENV || 'development',
  JWT_SECRET: process.env.JWT_SECRET || 'kidsstream_production_secret_key_2026',
  MONGODB_URI: process.env.MONGODB_URI || '',
  MONGODB_DATABASE: process.env.MONGODB_DATABASE || 'kidsstream',
  RESEND_API_KEY: process.env.RESEND_API_KEY || '',
  RESEND_FROM_EMAIL: process.env.RESEND_FROM_EMAIL || 'KiddoTube <onboarding@resend.dev>',
  DEFAULT_DAILY_LIMIT_MINUTES: 60,
  PIN_MAX_FAILED_ATTEMPTS: 3,
  PIN_LOCKOUT_MS: 60 * 1000 // 60 seconds lockout
};
