const { port, mongodbUri } = require("./config/env");
const connectDB = require("./config/db");
const logger = require("./config/logger");
const app = require("./app");

async function start() {
  try {
    await connectDB(mongodbUri);

    app.listen(port, () => {
      logger.info(`Server listening on port ${port}`);
    });
  } catch (err) {
    logger.error(`Failed to start server: ${err.message}`);
    // Lets the logger flush to file before exiting
    process.exitCode = 1;
  }
}

start();
