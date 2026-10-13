const jwt = require('jsonwebtoken');
const { jwtSecret } = require('../config/env');
const logger = require('../config/logger');

const authenticateToken = (req, res, next) => {
  // 1. Read the Authorization header
  const authHeader = req.headers['authorization'];

  // 2. Extract token from "Bearer <token>"
  const token = authHeader && authHeader.split(' ')[1];

  // 3. Reject if header or token is missing
  if (!token) {
    logger.warn(`Unauthorized request: Missing token on ${req.originalUrl}`);
    return res.status(401).json({ status: false, message: 'Access denied. Token missing.' });
  }

  try {
    // 4. Verify signature and expiration
    const decoded = jwt.verify(token, jwtSecret);

    // 5. Attach user details to req.user for controllers
    req.user = decoded;

    // 6. Pass control to the next middleware or controller
    next();
  } catch (error) {
    logger.warn(`Authentication failure: Invalid/Expired token on ${req.originalUrl}`);
    return res.status(401).json({ status: false, message: 'Invalid or expired token.' });
  }
};

module.exports = authenticateToken;