const jwt = require("jsonwebtoken");
const { jwtSecret } = require("../config/env");
const logger = require("../config/logger");

const unauthorized = (res, message) =>
  res.status(401).json({ status: false, message });

const authenticateToken = (req, res, next) => {
  const authHeader = req.headers["authorization"];
  if (!authHeader) {
    logger.warn(`Unauthorized request: Missing token on ${req.originalUrl}`);
    return unauthorized(res, "Access denied. Token missing.");
  }

  const [scheme, token] = authHeader.split(" ");
  if (scheme !== "Bearer" || !token) {
    logger.warn(
      `Unauthorized request: Malformed Authorization header on ${req.originalUrl}`,
    );
    return unauthorized(
      res,
      "Authorization header must be in the format: Bearer <token>.",
    );
  }

  try {
    // Only accept the algorithm used for signing
    const decoded = jwt.verify(token, jwtSecret, { algorithms: ["HS256"] });
    if (!decoded.id) {
      throw new jwt.JsonWebTokenError("Token payload missing user id");
    }

    req.user = decoded;
    next();
  } catch (error) {
    if (error.name === "TokenExpiredError") {
      logger.warn(
        `Authentication failure: Expired token on ${req.originalUrl}`,
      );
      return unauthorized(res, "Token expired. Please log in again.");
    }
    logger.warn(`Authentication failure: Invalid token on ${req.originalUrl}`);
    return unauthorized(res, "Invalid token.");
  }
};

module.exports = authenticateToken;
