const mongoose = require('mongoose');

const DB_NAME = 'comp3123_assignment1';

async function connectDB(uri) {
  await mongoose.connect(uri, { dbName: DB_NAME });
  console.log(`MongoDB connected: ${mongoose.connection.host}/${DB_NAME}`);
}

module.exports = connectDB;
