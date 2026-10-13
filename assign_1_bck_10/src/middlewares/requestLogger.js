const logger = require('../config/logger');

const requestLogger = (req, res, next) => {
  // Listen for the response "finish" event
  res.on('finish', () => {
    logger.info({
      method: req.method,      // e.g., "GET", "POST"
      path: req.originalUrl,   // e.g., "/api/v1/user/login"
      status: res.statusCode,  // e.g., 200, 401, 500
      ip: req.ip               // Client IP address
    });
  });

  // Call next() immediately so the request continues through the app
  next();
};

module.exports = requestLogger;