const errorHandler = (err, req, res, next) => {
  // Print error to terminal so you can debug easily during development
  console.error('SERVER ERROR:', err.message);

  // Set status code (default to 500 if not specified)
  let status = 500;
  if (err.status) {
    status = err.status;
  }

  // Send simple JSON response
  res.status(status).json({
    status: false,
    message: err.message || 'Internal Server Error'
  });
};

module.exports = errorHandler;