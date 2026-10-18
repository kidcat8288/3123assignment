const express = require("express");
const router = express.Router();

const validate = require("../middlewares/validate");
const { authLimiter } = require("../middlewares/rateLimiter");
const { signupValidator, loginValidator } = require("../validators/userValidator");
const userController = require("../controllers/userController");

router.post("/signup", authLimiter, signupValidator, validate, userController.signup);
router.post("/login", authLimiter, loginValidator, validate, userController.login);

module.exports = router;
