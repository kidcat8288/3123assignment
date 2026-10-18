const express = require("express");
const helmet = require("helmet");
const mongoose = require("mongoose");

const requestLogger = require("./middlewares/requestLogger");
const errorHandler = require("./middlewares/errorHandler");
const { apiLimiter } = require("./middlewares/rateLimiter");

const userRoutes = require("./routes/userRoutes");
const employeeRoutes = require("./routes/employeeRoutes");

const app = express();

const DB_STATES = ["disconnected", "connected", "connecting", "disconnecting"];

app.use(helmet());
app.use(express.json({ limit: "10kb" }));
app.use(requestLogger);
app.use("/api", apiLimiter);

app.get("/health", (req, res) => {
  res.status(200).json({
    status: "ok",
    uptime: process.uptime(),
    timestamp: new Date(),
    database: DB_STATES[mongoose.connection.readyState] || "unknown",
  });
});

app.use("/api/v1/user", userRoutes);
app.use("/api/v1/emp", employeeRoutes);

app.use((req, res) => {
  res.status(404).json({ status: false, message: "Route not found." });
});

app.use(errorHandler);

module.exports = app;
