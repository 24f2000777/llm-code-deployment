const { GoogleGenerativeAI } = require('@google/generative-ai');
const logger = require('../utils/logger');

/**
 * LLM Client for code generation
 * Supports Google Gemini
 */

/**
 * Generate code using LLM
 * @param {string} prompt - The prompt for code generation
 * @returns {Promise<string>} - Generated code
 */
async function generateCode(prompt) {
  const apiKey = process.env.GEMINI_API_KEY;
  
  if (!apiKey) {
    throw new Error('GEMINI_API_KEY not configured');
  }
  
  try {
    logger.info('Calling Google Gemini API');
    
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash-exp' });
    
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();
    
    logger.info('Code generated successfully', { 
      length: text.length 
    });
    
    return text;
    
  } catch (error) {
    logger.error('LLM generation failed', { 
      error: error.message 
    });
    throw error;
  }
}

module.exports = {
  generateCode
};