const logger = require('./logger');

/**
 * Verifies the secret from the request matches the expected secret
 * @param {string} providedSecret - The secret from the request
 * @returns {boolean} - True if secret is valid, false otherwise
 */
function verifySecret(providedSecret) {
  try {
    // Get expected secret from environment
    const expectedSecret = process.env.USER_SECRET;
    
    if (!expectedSecret) {
      logger.error('USER_SECRET not configured in environment variables');
      // In development, you might want to skip verification
      if (process.env.NODE_ENV === 'development') {
        logger.warn('Development mode: Secret verification skipped');
        return true;
      }
      return false;
    }

    // Simple string comparison
    const isValid = providedSecret === expectedSecret;
    
    if (isValid) {
      logger.info('Secret verification successful');
    } else {
      logger.error('Secret verification failed - provided secret does not match');
    }
    
    return isValid;

  } catch (error) {
    logger.error('Error during secret verification', { 
      error: error.message,
      stack: error.stack 
    });
    return false;
  }
}

module.exports = {
  verifySecret
};