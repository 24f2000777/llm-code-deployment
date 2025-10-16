const express = require('express');
const bodyParser = require('body-parser');
const logger = require('../utils/logger');
const taskHandler = require('./taskHandler');

class Server {
  constructor() {
    this.app = express();
    this.port = process.env.PORT || 3000;
    this.setupMiddleware();
    this.setupRoutes();
  }

  /**
   * Setup Express middleware
   */
  setupMiddleware() {
    // Parse JSON bodies
    this.app.use(bodyParser.json({ limit: '50mb' }));
    this.app.use(bodyParser.urlencoded({ extended: true, limit: '50mb' }));

    // Request logging
    this.app.use((req, res, next) => {
      logger.info('Incoming request', {
        method: req.method,
        path: req.path,
        ip: req.ip
      });
      next();
    });

    // CORS headers
    this.app.use((req, res, next) => {
      res.header('Access-Control-Allow-Origin', '*');
      res.header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
      res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
      
      if (req.method === 'OPTIONS') {
        return res.sendStatus(200);
      }
      next();
    });
  }

  /**
   * Setup API routes
   */
  setupRoutes() {
    // Health check endpoint
    this.app.get('/health', (req, res) => {
      res.json({
        status: 'healthy',
        timestamp: new Date().toISOString(),
        service: 'LLM Code Deployer'
      });
    });

    // Main task endpoint
    const apiPath = process.env.API_ENDPOINT_PATH || '/api/task';
    this.app.post(apiPath, async (req, res) => {
      try {
        logger.info('Task endpoint called', { 
          endpoint: apiPath,
          body: this.sanitizeRequestForLog(req.body)
        });

        // Handle the task
        const response = await taskHandler.handleTask(req.body);

        // Return response (just status per specification)
        res.status(200).json(response);

      } catch (error) {
        logger.error('Task endpoint error', { 
          error: error.message,
          stack: error.stack 
        });

        // Return error response
        res.status(error.message.includes('Invalid secret') ? 401 : 500).json({
          error: error.message
        });
      }
    });

    // 404 handler
    this.app.use((req, res) => {
      logger.warn('Route not found', { path: req.path });
      res.status(404).json({ 
        error: 'Not Found',
        message: `Route ${req.path} does not exist`
      });
    });

    // Error handler
    this.app.use((err, req, res, next) => {
      logger.error('Unhandled error', { 
        error: err.message,
        stack: err.stack 
      });
      res.status(500).json({ 
        error: 'Internal Server Error',
        message: err.message 
      });
    });
  }

  /**
   * Sanitize request for logging (hide sensitive data)
   */
  sanitizeRequestForLog(body) {
    const sanitized = { ...body };
    if (sanitized.secret) {
      sanitized.secret = '***HIDDEN***';
    }
    return sanitized;
  }

  /**
   * Start the server
   */
  start() {
    this.app.listen(this.port, () => {
      logger.info('='.repeat(80));
      logger.info('🚀 Server Started Successfully');
      logger.info('='.repeat(80));
      logger.info(`📍 Port: ${this.port}`);
      logger.info(`🔗 API Endpoint: ${process.env.API_ENDPOINT_PATH || '/api/task'}`);
      logger.info(`👤 Student Email: ${process.env.STUDENT_EMAIL}`);
      logger.info(`🐙 GitHub User: ${process.env.GITHUB_USERNAME}`);
      logger.info(`📝 Log Level: ${process.env.LOG_LEVEL || 'info'}`);
      logger.info('='.repeat(80));
      logger.info('✅ Server is ready to receive tasks!');
      logger.info('='.repeat(80));
    });
  }
}

module.exports = Server;