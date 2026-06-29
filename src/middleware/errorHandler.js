const logger = require('../config/logger');
const { sendError } = require('../utils/response');

/**
 * Global 404 handler
 */
const notFound = (req, res, next) => {
  sendError(res, `Route not found: ${req.method} ${req.originalUrl}`, 404);
};

/**
 * Global error handler — must be last middleware
 */
// eslint-disable-next-line no-unused-vars
const errorHandler = (err, req, res, next) => {
  logger.error(`${err.message} - ${req.method} ${req.originalUrl}`, { stack: err.stack });

  // Postgres unique constraint violation
  if (err.code === '23505') {
    return sendError(res, 'Resource already exists', 409);
  }

  // Postgres foreign key violation
  if (err.code === '23503') {
    return sendError(res, 'Referenced resource not found', 400);
  }

  const statusCode = err.statusCode || 500;
  const message = err.isOperational ? err.message : 'Internal Server Error';
  sendError(res, message, statusCode);
};

module.exports = { notFound, errorHandler };
