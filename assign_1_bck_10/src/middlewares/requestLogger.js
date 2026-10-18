const logger = require("../config/logger");

const requestLogger = (req, res, next) => {
  res.on("finish", () => {
    logger.info({
      method: req.method,
      path: req.originalUrl,
      status: res.statusCode,
      ip: req.ip,
    });
  });

  next();
};

module.exports = requestLogger;
