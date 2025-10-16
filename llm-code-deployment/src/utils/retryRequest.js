const logger = require('./logger');

/**
 * Retry a request with exponential backoff
 * @param {Function} requestFn - Async function that performs the request
 * @param {number} maxRetries - Maximum number of retry attempts (default: 5)
 * @param {number} initialDelay - Initial delay in seconds (default: 1)
 * @returns {Promise} - Result of the request
 */
async function retryRequest(requestFn, maxRetries = 5, initialDelay = 1) {
  let lastError;

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      logger.info(`Retry attempt ${attempt}/${maxRetries}`);
      
      // Call the request function
      const result = await requestFn();
      
      logger.info(`Request succeeded on attempt ${attempt}`);
      return result;

    } catch (error) {
      lastError = error;
      logger.error(`Request failed on attempt ${attempt}/${maxRetries}`, {
        error: error.message,
        attempt
      });

      // If this was the last attempt, don't wait
      if (attempt === maxRetries) {
        break;
      }

      // Calculate delay with exponential backoff: 1, 2, 4, 8, 16 seconds
      const delaySeconds = initialDelay * Math.pow(2, attempt - 1);
      logger.info(`Waiting ${delaySeconds} seconds before retry...`);
      
      // Wait before next retry
      await new Promise(resolve => setTimeout(resolve, delaySeconds * 1000));
    }
  }

  // All retries failed
  const errorMessage = `Failed after ${maxRetries} attempts: ${lastError.message}`;
  logger.error('All retry attempts failed', {
    maxRetries,
    finalError: lastError.message
  });
  
  throw new Error(errorMessage);
}

module.exports = {
  retryRequest
};