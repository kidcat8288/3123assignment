const validator = require('express-validator');

const body = validator.body;
const validationResult = validator.validationResult;


const logger = require('../config/logger');

//req:incoming http request,res:Http respond you sned back, next:Function that continues Express processing
//
const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);

  // If errors exist, return HTTP 400 Bad Request
  if (!errors.isEmpty()) {
    logger.warn(`Validation failure on ${req.originalUrl}: ${JSON.stringify(errors.array())}`);
    return res.status(400).json({
      status: false,
      errors: errors.array()
    });
  }

  // If no errors, pass control to the next middleware or controller
  next();
};

// Validation rules for User Signup (POST /api/v1/user/signup)
const validateSignup = [
  body('username')
    .trim()
    .notEmpty().withMessage('Username is required')
    .isLength({ min: 3 }).withMessage('Username must be at least 3 characters long'),

  body('email')
    .trim()
    .notEmpty().withMessage('Email is required')
    .isEmail().withMessage('Must be a valid email address'),

  body('password')
    .notEmpty().withMessage('Password is required')
    .isLength({ min: 6 }).withMessage('Password must be at least 6 characters long')
    .matches(/\d/).withMessage('Password must contain at least one number'),

  handleValidationErrors
];

// Validation rules for User Login (POST /api/v1/user/login)
const validateLogin = [
  body('loginIdentifier')
    .trim()
    .notEmpty().withMessage('Username or Email is required'),

  body('password')
    .notEmpty().withMessage('Password is required'),

  handleValidationErrors
];

module.exports = {
  validateSignup,
  validateLogin
};