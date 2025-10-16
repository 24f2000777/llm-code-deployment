#!/usr/bin/env node

/**
 * LLM Code Deployment - Main Entry Point
 * 
 * This application receives task requests, generates code using LLMs,
 * deploys to GitHub Pages, and notifies evaluation servers.
 */

require('dotenv').config();
const Server = require('./src/api/server');
const logger = require('./src/utils/logger');

// Validate environment variables
function validateEnvironment() {
  const required = [
    'STUDENT_EMAIL',
    'USER_SECRET',
    'GITHUB_TOKEN',
    'GITHUB_USERNAME'
  ];

  const missing = required.filter(key => !process.env[key]);

  if (missing.length > 0) {
    logger.error('Missing required environment variables', { missing });
    console.error('\n❌ ERROR: Missing required environment variables:');
    missing.forEach(key => console.error(`   - ${key}`));
    console.error('\nPlease set these in your .env file\n');
    process.exit(1);
  }

  // Check for at least one LLM API key
  const llmKeys = ['GEMINI_API_KEY', 'OPENAI_API_KEY', 'ANTHROPIC_API_KEY', 'AIPIPE_TOKEN'];
  const hasLLM = llmKeys.some(key => process.env[key]);

  if (!hasLLM) {
    logger.warn('No LLM API key found', { availableKeys: llmKeys });
    console.warn('\n⚠️  WARNING: No LLM API key found!');
    console.warn('Please set one of the following in your .env file:');
    llmKeys.forEach(key => console.warn(`   - ${key}`));
    console.warn('\nThe application will fail when trying to generate code.\n');
  }

  logger.info('Environment validation passed');
}

// Main function
function main() {
  try {
    logger.info('Starting LLM Code Deployment application');

    // Validate environment
    validateEnvironment();

    // Display configuration
    console.log('\n📋 Configuration:');
    console.log(`   Student Email: ${process.env.STUDENT_EMAIL}`);
    console.log(`   GitHub User: ${process.env.GITHUB_USERNAME}`);
    console.log(`   Secret: ${process.env.USER_SECRET ? '***SET***' : 'NOT SET'}`);
    console.log(`   Port: ${process.env.PORT || 3000}`);
    
    const llmProvider = process.env.GEMINI_API_KEY ? 'Google Gemini' :
                       process.env.ANTHROPIC_API_KEY ? 'Claude' :
                       process.env.OPENAI_API_KEY ? 'OpenAI' :
                       process.env.AIPIPE_TOKEN ? 'AIPipe' : 'None';
    console.log(`   LLM Provider: ${llmProvider}\n`);

    // Create and start server
    const server = new Server();
    server.start();

  } catch (error) {
    logger.error('Application startup failed', {
      error: error.message,
      stack: error.stack
    });
    console.error('\n❌ Failed to start application:', error.message);
    process.exit(1);
  }
}

// Handle graceful shutdown
process.on('SIGTERM', () => {
  logger.info('Received SIGTERM signal, shutting down gracefully');
  process.exit(0);
});

process.on('SIGINT', () => {
  logger.info('Received SIGINT signal, shutting down gracefully');
  process.exit(0);
});

// Run the application
main();