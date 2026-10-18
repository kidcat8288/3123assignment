const jwt = require("jsonwebtoken");
const { matchedData } = require("express-validator");
const { jwtSecret, jwtExpiresIn } = require("../config/env");
const logger = require("../config/logger");
const userService = require("../services/userService");
const AppError = require("../utils/AppError");

const signup = async (req, res) => {
  const { username, email, password } = matchedData(req, {
    locations: ["body"],
  });

  const user = await userService.createUser({ username, email, password });
  logger.info(`User signed up: ${user.username} (${user._id})`);

  res.status(201).json({
    status: true,
    message: "User created successfully.",
    user_id: user._id,
  });
};

const login = async (req, res) => {
  const { username, email, password } = matchedData(req, {
    locations: ["body"],
  });
  const identifier = username || email;

  const user = await userService.findByUsernameOrEmail({ username, email });
  // Same message for both cases to prevent account probing
  if (!user || !(await user.comparePassword(password))) {
    logger.warn(`Failed login attempt for "${identifier}"`);
    throw new AppError(401, "Invalid username/email or password.");
  }

  const token = jwt.sign(
    { id: user._id.toString(), username: user.username },
    jwtSecret,
    { expiresIn: jwtExpiresIn },
  );
  logger.info(`User logged in: ${user.username} (${user._id})`);

  res.status(200).json({
    status: true,
    message: "Login successful.",
    token,
  });
};

module.exports = {
  signup,
  login,
};
