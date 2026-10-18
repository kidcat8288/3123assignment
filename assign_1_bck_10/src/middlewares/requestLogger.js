const logger = require("../config/logger");

// Never log bodies or headers, they may contain passwords or tokens
const requestLogger = (req, res, next) => {
  const start = process.hrtime.bigint();

  res.on("finish", () => {
    const durationMs = Number(process.hrtime.bigint() - start) / 1e6;
    logger.info("HTTP request", {
      method: req.method,
      path: req.originalUrl,
      status: res.statusCode,
      duration_ms: Math.round(durationMs),
      ip: req.ip,
    });
  });

  next();
};

module.exports = requestLogger;
