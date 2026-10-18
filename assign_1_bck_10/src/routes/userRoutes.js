const express = require("express");
const router = express.Router();

const validate = require("../middlewares/validate");
const { signupLimiter, loginLimiter } = require("../middlewares/rateLimiter");
const {
  signupValidator,
  loginValidator,
} = require("../validators/userValidator");
const userController = require("../controllers/userController");

router.post(
  "/signup",
  signupLimiter,
  signupValidator,
  validate,
  userController.signup,
);
router.post(
  "/login",
  loginLimiter,
  loginValidator,
  validate,
  userController.login,
);

module.exports = router;
