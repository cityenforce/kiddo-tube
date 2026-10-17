function errorHandler(err, req, res, next) {
  console.error(`[Error on ${req.method} ${req.originalUrl}]:`, err.message || err);

  const statusCode = err.statusCode || (res.statusCode !== 200 ? res.statusCode : 500);
  const message = err.message || 'Internal Server Error';

  return res.status(statusCode).json({
    success: false,
    error: message,
    timestamp: new Date().toISOString()
  });
}

module.exports = errorHandler;
