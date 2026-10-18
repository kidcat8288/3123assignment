const rateLimit = require("express-rate-limit");
const logger = require("../config/logger");

const FIFTEEN_MINUTES = 15 * 60 * 1000;

const createLimiter = (limit, message) =>
  rateLimit({
    windowMs: FIFTEEN_MINUTES,
    limit,
    standardHeaders: "draft-8",
    legacyHeaders: false,
    handler: (req, res, next, options) => {
      logger.warn(
        `Rate limit exceeded: ${req.ip} on ${req.method} ${req.originalUrl}`,
      );
      res.status(options.statusCode).json({ status: false, message });
    },
  });

const authLimiter = createLimiter(
  5,
  "Too many authentication attempts. Please try again after 15 minutes.",
);

const apiLimiter = createLimiter(
  100,
  "Too many requests. Please try again after 15 minutes.",
);

module.exports = { authLimiter, apiLimiter };
