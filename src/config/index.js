const dotenv = require('dotenv');
dotenv.config();

module.exports = {
  port: process.env.PORT || 5000,
  mongoUri: process.env.MONGO_URI,
  jwt: {
    secret: process.env.JWT_SECRET || 'dev_fallback_secret_key_finance_flow_987654321',
    expiresIn: process.env.JWT_EXPIRES_IN || '7d',
  },
};
