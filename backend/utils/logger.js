/**
 * Logger Utility
 * Centralized logging with different log levels
 */

const LOG_LEVELS = {
  ERROR: 0,
  WARN: 1,
  INFO: 2,
  DEBUG: 3
};

const CURRENT_LOG_LEVEL = process.env.LOG_LEVEL 
  ? LOG_LEVELS[process.env.LOG_LEVEL.toUpperCase()] || LOG_LEVELS.INFO
  : LOG_LEVELS.INFO;

/**
 * Formats log message with timestamp and context
 * @param {string} level - Log level
 * @param {string} message - Log message
 * @param {Object} context - Additional context (optional)
 * @returns {string} Formatted log message
 */
function formatLogMessage(level, message, context = null) {
  const timestamp = new Date().toISOString();
  const contextStr = context ? ` | ${JSON.stringify(context)}` : '';
  return `[${timestamp}] [${level}] ${message}${contextStr}`;
}

/**
 * Logs error messages
 * @param {string} message - Error message
 * @param {Error|Object} error - Error object or context
 * @param {Object} context - Additional context (optional)
 */
export function logError(message, error = null, context = null) {
  if (CURRENT_LOG_LEVEL >= LOG_LEVELS.ERROR) {
    const errorDetails = error instanceof Error 
      ? { message: error.message, stack: error.stack }
      : error;
    console.error(formatLogMessage('ERROR', message, { ...context, error: errorDetails }));
  }
}

/**
 * Logs warning messages
 * @param {string} message - Warning message
 * @param {Object} context - Additional context (optional)
 */
export function logWarn(message, context = null) {
  if (CURRENT_LOG_LEVEL >= LOG_LEVELS.WARN) {
    console.warn(formatLogMessage('WARN', message, context));
  }
}

/**
 * Logs info messages
 * @param {string} message - Info message
 * @param {Object} context - Additional context (optional)
 */
export function logInfo(message, context = null) {
  if (CURRENT_LOG_LEVEL >= LOG_LEVELS.INFO) {
    console.log(formatLogMessage('INFO', message, context));
  }
}

/**
 * Logs debug messages
 * @param {string} message - Debug message
 * @param {Object} context - Additional context (optional)
 */
export function logDebug(message, context = null) {
  if (CURRENT_LOG_LEVEL >= LOG_LEVELS.DEBUG) {
    console.log(formatLogMessage('DEBUG', message, context));
  }
}

