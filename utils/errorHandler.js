/**
 * Error Handler Utilities
 * Provides try-catch decorators and error handling helpers
 */

import { logError } from './logger.js';

/**
 * Custom error class for application-specific errors
 */
export class AppError extends Error {
  constructor(message, statusCode = 500, code = 'INTERNAL_ERROR') {
    super(message);
    this.name = 'AppError';
    this.statusCode = statusCode;
    this.code = code;
    Error.captureStackTrace(this, this.constructor);
  }
}

/**
 * Try-catch decorator for async functions
 * Automatically handles errors and logs them
 * @param {Function} fn - Async function to wrap
 * @param {string} context - Context name for logging
 * @returns {Function} Wrapped function
 */
export function asyncHandler(fn, context = 'Unknown') {
  return async (...args) => {
    try {
      return await fn(...args);
    } catch (error) {
      logError(`Error in ${context}`, error, { 
        function: fn.name,
        args: args.length 
      });
      throw error;
    }
  };
}

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

/**
 * Wraps a promise with error handling
 * @param {Promise} promise - Promise to wrap
 * @param {string} context - Context for logging
 * @returns {Promise} Wrapped promise
 */
export async function handlePromise(promise, context = 'Operation') {
  try {
    return await promise;
  } catch (error) {
    logError(`${context} failed`, error);
    throw error;
  }
}

