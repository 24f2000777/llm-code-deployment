const logger = require('../utils/logger');
const { verifySecret } = require('../utils/verifySecret');
const { retryRequest } = require('../utils/retryRequest');
const codeGenerator = require('../generator/codeGenerator');
const GitHubManager = require('../github/githubManager');

class TaskHandler {
  constructor() {
    this.githubManager = new GitHubManager();
    this.processedTasks = new Map(); // Track processed tasks to avoid duplicates
    this.repoTracking = new Map(); // Track repositories by email for Round 2
  }

  /**
   * Handle incoming task request
   * @param {object} request - The task request
   * @returns {Promise<object>} - Response (empty or status only)
   */
  async handleTask(request) {
    const startTime = Date.now();
    logger.info('Received task request', { 
      email: request.email,
      task: request.task,
      round: request.round 
    });

    try {
      // Step 1: Validate request structure
      this.validateRequest(request);

      // Step 2: Verify secret
      if (!this.verifyRequestSecret(request)) {
        throw new Error('Invalid secret');
      }

      // Step 3: Determine actual repository name
      const repoName = this.determineRepoName(request);
      
      // Step 4: Check for duplicate requests
      const taskKey = `${repoName}-${request.round}`;
      if (this.processedTasks.has(taskKey)) {
        logger.warn('Duplicate task request detected', { taskKey });
        // Still return 200 OK
        return { status: 'duplicate' };
      }

      // Mark task as processing
      this.processedTasks.set(taskKey, { status: 'processing', timestamp: Date.now() });

      // Step 5: Process task asynchronously
      // Return immediately, then process in background
      this.processTaskAsync(request, repoName).catch(error => {
        logger.error('Async task processing failed', { error: error.message });
        this.processedTasks.set(taskKey, { status: 'failed', error: error.message });
      });

      const responseTime = Date.now() - startTime;
      logger.info('Task accepted and processing', { 
        responseTime: `${responseTime}ms`,
        task: repoName 
      });

      // Return simple acknowledgment - NO USERCODE
      return { status: 'accepted' };

    } catch (error) {
      logger.error('Task handling failed', { 
        error: error.message,
        task: request.task 
      });
      throw error;
    }
  }

  /**
   * Determine the actual repository name to use
   * For Round 1: Use the provided task name
   * For Round 2: Use provided task name, or fall back to last repo for this email
   * @param {object} request - The request
   * @returns {string} - The repository name
   */
  determineRepoName(request) {
    const { task, round, email } = request;

    if (round === 1) {
      // Round 1: Task name is required
      if (!task || !task.trim()) {
        throw new Error('Task name is required for Round 1');
      }
      
      // Store this repo for the email
      this.repoTracking.set(email, task);
      logger.info('Repository tracked for email', { email, repoName: task });
      
      return task;

    } else {
      // Round 2: Try to use provided task name, or fall back to tracked repo
      if (task && task.trim()) {
        logger.info('Using provided task name for Round 2', { task });
        return task;
      }

      // Task is empty, try to get the last repo for this email
      const trackedRepo = this.repoTracking.get(email);
      
      if (!trackedRepo) {
        logger.error('Cannot determine repository name', { 
          email, 
          round, 
          taskEmpty: !task || !task.trim() 
        });
        throw new Error(
          `Cannot determine repository name for Round 2. ` +
          `Task field is empty and no previous repository found for email ${email}. ` +
          `Please provide the task/repository name in the request.`
        );
      }

      logger.info('Using tracked repository for Round 2', { 
        email, 
        repoName: trackedRepo 
      });
      
      return trackedRepo;
    }
  }

  /**
   * Validate request has all required fields
   * @param {object} request - The request to validate
   */
  validateRequest(request) {
    const requiredFields = [
      'email', 
      'secret',
      'task', 
      'round', 
      'nonce', 
      'brief', 
      'checks', 
      'evaluation_url', 
      'attachments'
    ];

    for (const field of requiredFields) {
      if (!(field in request)) {
        throw new Error(`Missing required field: ${field}`);
      }
    }

    // Validate round is 1 or 2
    if (request.round !== 1 && request.round !== 2) {
      throw new Error('Round must be 1 or 2');
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(request.email)) {
      throw new Error('Invalid email format');
    }

    logger.info('Request validation passed');
  }

  /**
   * Verify request secret
   * @param {object} request - The request with secret
   * @returns {boolean} - True if valid
   */
  verifyRequestSecret(request) {
    try {
      const isValid = verifySecret(request.secret);
      
      if (!isValid) {
        logger.error('Secret verification failed');
        return false;
      }

      logger.info('Secret verified successfully');
      return true;

    } catch (error) {
      logger.error('Secret verification error', { error: error.message });
      return false;
    }
  }

  /**
   * Process task asynchronously (background processing)
   */
  async processTaskAsync(request, repoName) {
    const { email, round, nonce, evaluation_url, brief, checks, attachments } = request;

    try {
      logger.info('Starting async task processing', { task: repoName, round });

      let repoDetails;

      if (round === 1) {
        // Round 1: Generate and deploy new application
        logger.info('Processing Round 1: Generate and deploy');

        // Generate application code
        const files = await codeGenerator.generateApplication(request);
        
        // Create and deploy repository
        repoDetails = await this.githubManager.createAndDeployRepo(repoName, files, round);

      } else if (round === 2) {
        // Round 2: Update existing application
        logger.info('Processing Round 2: Update existing application');

        // Generate updated code
        const files = await codeGenerator.generateApplication(request);
        
        // Update existing repository (already sanitized in determineRepoName)
        const sanitizedRepoName = this.githubManager.sanitizeRepoName(repoName);
        repoDetails = await this.githubManager.updateRepo(sanitizedRepoName, files);

      } else {
        throw new Error(`Unsupported round number: ${round}`);
      }

      // 🔍 BUILD COMPLETE PAYLOAD
      const completePayload = {
        email: email,
        task: repoName,
        round: round,
        nonce: nonce,
        repo_url: repoDetails.repo_url,
        commit_sha: repoDetails.commit_sha,
        pages_url: repoDetails.pages_url
      };

      // 🔍 LOG COMPLETE PAYLOAD AS SINGLE JSON OBJECT
      logger.info('================================================================================');
      logger.info('📦 COMPLETE EVALUATION PAYLOAD (This is what evaluation server receives):');
      logger.info('================================================================================');
      logger.info(JSON.stringify(completePayload, null, 2));
      logger.info('================================================================================');

      // Notify evaluation server within 10 minutes
      await this.notifyEvaluationServer(evaluation_url, completePayload);

      // Mark task as completed
      const taskKey = `${repoName}-${round}`;
      this.processedTasks.set(taskKey, { 
        status: 'completed', 
        timestamp: Date.now(),
        repoDetails 
      });

      logger.info('Task processing completed successfully', { task: repoName, round });

    } catch (error) {
      logger.error('Async task processing failed', { 
        error: error.message,
        stack: error.stack,
        task: repoName,
        round 
      });
      throw error;
    }
  }

  /**
   * Notify evaluation server with retry logic
   */
  async notifyEvaluationServer(evaluationUrl, data) {
    logger.info('Notifying evaluation server', { 
      url: evaluationUrl,
      task: data.task,
      round: data.round 
    });

    const maxRetries = parseInt(process.env.MAX_RETRIES) || 5;
    const initialDelay = parseInt(process.env.INITIAL_RETRY_DELAY) || 1;

    try {
      await retryRequest(
        async () => {
          const axios = require('axios');
          const response = await axios.post(evaluationUrl, data, {
            headers: {
              'Content-Type': 'application/json'
            },
            timeout: 30000
          });

          if (response.status !== 200) {
            throw new Error(`Evaluation server returned status ${response.status}`);
          }

          logger.info('Evaluation server notified successfully', { 
            status: response.status 
          });
          return response.data;
        },
        maxRetries,
        initialDelay
      );

    } catch (error) {
      logger.error('Failed to notify evaluation server after retries', { 
        error: error.message,
        url: evaluationUrl 
      });
      throw error;
    }
  }
}

module.exports = new TaskHandler();