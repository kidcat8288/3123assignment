const rateLimit = require('express-rate-limit');


const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10,                  // Max 10 attempts
  message: {
    status: false,
    message: 'Too many attempts. Please try again after 15 minutes.'
  }
});

module.exports = { authLimiter };