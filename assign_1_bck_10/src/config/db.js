const mongoose = require("mongoose");
const logger = require("./logger");

const DB_NAME = "comp3123_assignment1";

async function connectDB(uri) {
  // Overrides any database name in the URI
  logger.info(`Connecting to ${uri}`);
  await mongoose.connect(uri, { dbName: DB_NAME });
  logger.info(`MongoDB connected: ${mongoose.connection.host}/${DB_NAME}`);

  mongoose.connection.on("disconnected", () =>
    logger.warn("MongoDB disconnected"),
  );
  mongoose.connection.on("reconnected", () =>
    logger.info("MongoDB reconnected"),
  );
}

module.exports = connectDB;
