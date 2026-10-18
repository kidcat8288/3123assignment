const { body } = require("express-validator");

// isString runs before trim to reject non string payloads
const signupValidator = [
  body("username")
    .isString()
    .withMessage("Username must be a string")
    .bail()
    .trim()
    .notEmpty()
    .withMessage("Username is required")
    .isLength({ min: 3, max: 30 })
    .withMessage("Username must be 3-30 characters")
    .matches(/^[a-zA-Z0-9_]+$/)
    .withMessage("Username may only contain letters, numbers and underscores"),
  body("email")
    .isString()
    .withMessage("Email must be a string")
    .bail()
    .trim()
    .notEmpty()
    .withMessage("Email is required")
    .isEmail()
    .withMessage("Invalid email format")
    .isLength({ max: 100 })
    .withMessage("Email is too long"),
  body("password")
    .isString()
    .withMessage("Password must be a string")
    .bail()
    .notEmpty()
    .withMessage("Password is required")
    .isLength({ min: 8, max: 128 })
    .withMessage("Password must be 8-128 characters")
    .matches(/[A-Za-z]/)
    .withMessage("Password must contain a letter")
    .matches(/\d/)
    .withMessage("Password must contain a number"),
];

const loginValidator = [
  body().custom((value) => {
    if (!value || (!value.username && !value.email)) {
      throw new Error("Username or email is required");
    }
    return true;
  }),
  body("username")
    .optional()
    .isString()
    .withMessage("Username must be a string")
    .bail()
    .trim()
    .notEmpty()
    .withMessage("Username cannot be empty"),
  body("email")
    .optional()
    .isString()
    .withMessage("Email must be a string")
    .bail()
    .trim()
    .isEmail()
    .withMessage("Invalid email format"),
  body("password")
    .isString()
    .withMessage("Password must be a string")
    .bail()
    .notEmpty()
    .withMessage("Password is required"),
];

module.exports = {
  signupValidator,
  loginValidator,
};
