const logger = require("../config/logger");

// Central error handler: maps known errors to 4xx, hides internals on 500
const errorHandler = (err, req, res, next) => {
  const where = `${req.method} ${req.originalUrl}`;

  // Body is not valid JSON (thrown by express.json)
  if (err.type === "entity.parse.failed") {
    logger.warn(`Malformed JSON on ${where}`);
    return res.status(400).json({ status: false, message: "Malformed JSON in request body." });
  }

  // Mongoose schema validation failed
  if (err.name === "ValidationError") {
    logger.warn(`Model validation failed on ${where}`);
    return res.status(400).json({
      status: false,
      message: "Validation failed.",
      errors: Object.values(err.errors).map((e) => ({ field: e.path, message: e.message })),
    });
  }

  // Value could not be cast to the schema type (e.g. bad ObjectId)
  if (err.name === "CastError") {
    logger.warn(`Invalid ${err.path} on ${where}`);
    return res.status(400).json({ status: false, message: `Invalid ${err.path}.` });
  }

  // Unique index violation
  if (err.code === 11000) {
    logger.warn(`Duplicate key on ${where}`);
    return res.status(409).json({ status: false, message: "Resource already exists." });
  }

  // Expected errors (AppError, body-parser 4xx) carry a safe message
  const status = err.status || err.statusCode || 500;
  if (status < 500) {
    logger.warn(`${status} on ${where}: ${err.message}`);
    return res.status(status).json({ status: false, message: err.message });
  }

  // Unexpected: log details, return a generic message
  logger.error(`Unhandled error on ${where}`, err);
  res.status(500).json({ status: false, message: "Internal Server Error" });
};

module.exports = errorHandler;
