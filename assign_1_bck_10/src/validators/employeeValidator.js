const { body, param, query, validationResult } = require('express-validator');
const mongoose = require('mongoose');
const logger = require('../config/logger');

// Helper middleware: Checks if validation errors occurred
const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    logger.warn(`Validation failure on ${req.originalUrl}: ${JSON.stringify(errors.array())}`);
    return res.status(400).json({
      status: false,
      errors: errors.array()
    });
  }

  next();
};

// Validation rules for creating/updating employees
const validateEmployee = [
  body('first_name')
    .trim()
    .notEmpty().withMessage('First name is required'),

  body('last_name')
    .trim()
    .notEmpty().withMessage('Last name is required'),

  body('email')
    .trim()
    .notEmpty().withMessage('Email is required')
    .isEmail().withMessage('Must be a valid email address'),

  body('position')
    .trim()
    .notEmpty().withMessage('Position is required'),

  body('salary')
    .notEmpty().withMessage('Salary is required')
    .isNumeric().withMessage('Salary must be a number')
    .custom((value) => value >= 0).withMessage('Salary must be a positive number'),

  body('date_of_joining')
    .notEmpty().withMessage('Date of joining is required')
    .isISO8601().toDate().withMessage('Valid date format is required (YYYY-MM-DD)'),

  body('department')
    .trim()
    .notEmpty().withMessage('Department is required'),

  handleValidationErrors
];

// Validate Mongo ObjectId in URL parameter (e.g., GET /api/v1/emp/employees/:eid)
const validateObjectIdParam = [
  param('eid')
    .custom((value) => mongoose.Types.ObjectId.isValid(value))
    .withMessage('Invalid Employee ObjectId format'),

  handleValidationErrors
];

// Validate Mongo ObjectId in Query parameter (e.g., DELETE /api/v1/emp/employees?eid=xxx)
const validateObjectIdQuery = [
  query('eid')
    .custom((value) => mongoose.Types.ObjectId.isValid(value))
    .withMessage('Invalid Employee ObjectId format in query parameter'),

  handleValidationErrors
];

module.exports = {
  validateEmployee,
  validateObjectIdParam,
  validateObjectIdQuery
};