const { port, mongodbUri } = require('./config/env');
const connectDB = require('./config/db');
const logger = require('./config/logger'); //Import winston logger
const app = require('./app');

async function start() {
  try {
    // 1. Connect to MongoDB
    await connectDB(mongodbUri);

    // 2. Start HTTP Listener
    app.listen(port, () => {
      logger.info(`Server initialized and listening on port ${port}`);
      console.log(`Server listening on port ${port}`);
    });
  } catch (err) {
    logger.error(`Failed to start server: ${err.message}`);
    console.error('Failed to start server:', err.message);
    process.exit(1);
  }
}

start();