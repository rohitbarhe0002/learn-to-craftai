/**
 * Error Handler Utilities
 * Provides try-catch decorators and error handling helpers
 */

import { logError } from './logger.js';

/**
 * Try-catch decorator for Express route handlers
 * Automatically sends error response
 * @param {Function} fn - Express route handler
 * @returns {Function} Wrapped route handler
 */
export function routeHandler(fn) {
  return async (req, res, next) => {
    try {
      await fn(req, res, next);
    } catch (error) {
      logError('Route handler error', error, {
        method: req.method,
        path: req.path,
        body: req.body
      });

      const statusCode = error.statusCode || error.status || 500;
      const message = error.message || 'Internal server error';
      const code = error.code || 'INTERNAL_ERROR';

      res.status(statusCode).json({
        error: message,
        code,
        ...(process.env.NODE_ENV === 'development' && { stack: error.stack })
      });
    }
  };
}

