import logger from '../utils/logger.js';

export const notFound = (req, res, next) => {
  const error = new Error(`Not Found - ${req.originalUrl}`);
  res.status(404);
  next(error);
};

export const errorHandler = (err, req, res, next) => {
  const statusCode = err.statusCode || (res.statusCode === 200 ? 500 : res.statusCode);
  
  // Log the error
  logger.error(`${err.message} - ${req.method} ${req.originalUrl} - IP: ${req.ip}`);
  if (err.stack && process.env.NODE_ENV !== 'production') {
    logger.debug(err.stack);
  }

  res.status(statusCode).json({
    success: false,
    message: err.message || 'Internal Server Error',
    errors: err.errors || null,
    stack: process.env.NODE_ENV === 'production' ? null : err.stack,
  });
};
