const { validationResult } = require("express-validator");
const logger = require("../config/logger");

const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    logger.warn(`Validation failed on ${req.method} ${req.originalUrl}`);
    return res.status(400).json({
      status: false,
      message: "Validation failed.",
      // Values are omitted, they may contain passwords
      errors: errors
        .array()
        .map(({ path, msg }) => ({ field: path, message: msg })),
    });
  }
  next();
};

module.exports = validate;
