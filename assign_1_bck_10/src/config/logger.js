const fs = require("fs");
const path = require("path");
const winston = require("winston");

const { combine, timestamp, errors, json, colorize, printf } = winston.format;

const LOG_DIR = path.join(__dirname, "..", "..", "logs");
fs.mkdirSync(LOG_DIR, { recursive: true });

const consoleFormat = printf(
  ({ timestamp, level, message, stack, ...meta }) => {
    const extra = Object.keys(meta).length ? ` ${JSON.stringify(meta)}` : "";
    return `${timestamp} ${level}: ${stack || message}${extra}`;
  },
);

const logger = winston.createLogger({
  level: "info",
  format: combine(timestamp(), errors({ stack: true }), json()),
  transports: [
    new winston.transports.Console({
      format: combine(
        timestamp(),
        errors({ stack: true }),
        colorize(),
        consoleFormat,
      ),
    }),
    new winston.transports.File({ filename: path.join(LOG_DIR, "app.log") }),
    new winston.transports.File({
      filename: path.join(LOG_DIR, "error.log"),
      level: "error",
    }),
  ],
});

module.exports = logger;
