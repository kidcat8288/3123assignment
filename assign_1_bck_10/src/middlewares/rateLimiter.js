const rateLimit = require("express-rate-limit");
const logger = require("../config/logger");

const FIFTEEN_MINUTES = 15 * 60 * 1000;

const createLimiter = (limit, message, options = {}) =>
  rateLimit({
    windowMs: FIFTEEN_MINUTES,
    limit,
    standardHeaders: "draft-8",
    legacyHeaders: false,
    handler: (req, res, next, opts) => {
      logger.warn(
        `Rate limit exceeded: ${req.ip} on ${req.method} ${req.originalUrl}`,
      );
      res.status(opts.statusCode).json({ status: false, message });
    },
    ...options,
  });

const signupLimiter = createLimiter(
  10,
  "Too many signup attempts. Please try again after 15 minutes.",
);

// Only failed logins count, to stop password guessing
const loginLimiter = createLimiter(
  10,
  "Too many failed login attempts. Please try again after 15 minutes.",
  { skipSuccessfulRequests: true },
);

const apiLimiter = createLimiter(
  100,
  "Too many requests. Please try again after 15 minutes.",
);

module.exports = { signupLimiter, loginLimiter, apiLimiter };
