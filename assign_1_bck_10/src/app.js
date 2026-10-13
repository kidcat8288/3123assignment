//All Express middleware definitions and route mounts here:


const express = require('express');
const helmet = require('helmet');
const requestLogger = require('./middlewares/requestLogger');
const errorHandler = require('./middlewares/errorHandler');
const { apiLimiter } = require('./middlewares/rateLimiter');


const userRoutes = require('./routes/userRoutes');
const employeeRoutes = require('./routes/employeeRoutes');


const app = express();

//security and global middlewares
app.use(helmet());
app.use(express.json());
app.use(requestLogger);
app.use('/api', apiLimiter);




app.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok',
    uptime:process.uptime(),
    timestamp:new Date(),
    database:'Connected'
   });
});

//API Routes
app.use('/api/vi/user',userRoutes);
app.use('/api/vi/emp',employeeRoutes)



// Handle 404 - Unsupported Routes
app.use((req, res, next) => {
  res.status(404).json({ status: false, message: 'Route not found.' });
});

// Centralized Error Handling Middleware
app.use(errorHandler);




module.exports = app;
