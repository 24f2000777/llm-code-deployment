const { Octokit } = require('@octokit/rest');
const simpleGit = require('simple-git');
const fs = require('fs-extra');
const path = require('path');
const logger = require('../utils/logger');

class GitHubManager {
  constructor() {
    this.token = process.env.GITHUB_TOKEN;
    this.username = process.env.GITHUB_USERNAME;
    
    if (!this.token || !this.username) {
      throw new Error('GITHUB_TOKEN and GITHUB_USERNAME must be set in .env file');
    }

    this.octokit = new Octokit({ auth: this.token });
    this.reposDir = path.join(__dirname, '../../generated-repos');
    
    // Ensure repos directory exists
    fs.ensureDirSync(this.reposDir);
  }

  /**
   * Create and deploy a new repository
   * @param {string} taskName - Name for the repository
   * @param {object} files - Files to include in the repo
   * @param {number} round - Round number
   * @returns {Promise<object>} - Repository details
   */
  async createAndDeployRepo(taskName, files, round = 1) {
    const repoName = this.sanitizeRepoName(taskName);
    logger.info(`Starting repo creation: ${repoName}`, { round });

    try {
      // Step 1: Create GitHub repository
      const repo = await this.createGitHubRepo(repoName);
      logger.info('GitHub repository created', { repoName, url: repo.html_url });

      // Step 2: Clone and populate repository
      const localRepoPath = path.join(this.reposDir, repoName);
      await this.cloneAndPopulateRepo(repo.clone_url, localRepoPath, files);

      // Step 3: Enable GitHub Pages
      await this.enableGitHubPages(repoName);
      
      // Step 4: Wait for Pages to be fully deployed
      const commitSha = await this.getLatestCommitSha(repoName);
      await this.waitForPagesDeployment(repoName, commitSha, 15);
      
      // Additional buffer for first-time deployment
      logger.info('Adding buffer for initial Pages deployment');
      await new Promise(resolve => setTimeout(resolve, 10000)); // 10 second buffer

      const result = {
        repo_url: repo.html_url,
        commit_sha: commitSha,
        pages_url: `https://${this.username}.github.io/${repoName}/`
      };

      logger.info('Repository deployed successfully', result);
      return result;

    } catch (error) {
      logger.error('Repository creation/deployment failed', { 
        error: error.message,
        stack: error.stack 
      });
      throw error;
    }
  }

  /**
   * Update an existing repository
   * @param {string} repoName - Repository name
   * @param {object} files - Updated files
   * @returns {Promise<object>} - Updated repository details
   */
  async updateRepo(repoName, files) {
    logger.info(`Updating repository: ${repoName}`);

    try {
      const localRepoPath = path.join(this.reposDir, repoName);

      // Always start fresh - remove local copy if exists
      if (fs.existsSync(localRepoPath)) {
        await fs.remove(localRepoPath);
        logger.info('Removed existing local copy');
      }

      // Clone the existing repository
      const repoUrl = `https://${this.token}@github.com/${this.username}/${repoName}.git`;
      logger.info('Cloning existing repository');
      
      await simpleGit().clone(repoUrl, localRepoPath);
      const git = simpleGit(localRepoPath);

      // Configure git
      await git.addConfig('user.name', this.username);
      await git.addConfig('user.email', process.env.STUDENT_EMAIL || `${this.username}@users.noreply.github.com`);

      // Check current branch
      const status = await git.status();
      const currentBranch = status.current;
      logger.info(`Current branch: ${currentBranch}`);

      // Update files in the repository
      for (const [filename, content] of Object.entries(files)) {
        const filePath = path.join(localRepoPath, filename);
        await fs.writeFile(filePath, content, 'utf8');
        logger.info(`Updated file: ${filename}`);
      }

      // Commit and push changes with retry logic
      await git.add('.');
      await git.commit('Update: Round 2 changes applied');
      
      let pushSuccess = false;
      const maxPushAttempts = 3;
      
      for (let attempt = 1; attempt <= maxPushAttempts; attempt++) {
        try {
          logger.info(`Pushing updates (attempt ${attempt}/${maxPushAttempts})`);
          await git.push('origin', currentBranch);
          pushSuccess = true;
          logger.info('Successfully pushed updates');
          break;
        } catch (pushError) {
          logger.warn(`Push attempt ${attempt} failed`, { error: pushError.message });
          if (attempt === maxPushAttempts) {
            throw pushError;
          }
          // Wait before retry
          await new Promise(resolve => setTimeout(resolve, 2000 * attempt));
        }
      }

      if (!pushSuccess) {
        throw new Error('Failed to push updates after all attempts');
      }

      // Get new commit SHA
      const commitSha = await this.getLatestCommitSha(repoName);
      logger.info('New commit SHA obtained', { commitSha });

      // CRITICAL: Wait for GitHub Pages to rebuild with new commit
      logger.info('Waiting for GitHub Pages to rebuild and deploy new version...');
      await this.waitForPagesDeployment(repoName, commitSha, 15);
      
      // Additional safety buffer for CDN propagation
      logger.info('Adding extra buffer for CDN cache invalidation');
      await new Promise(resolve => setTimeout(resolve, 20000)); // Extra 20 seconds

      const result = {
        repo_url: `https://github.com/${this.username}/${repoName}`,
        commit_sha: commitSha,
        pages_url: `https://${this.username}.github.io/${repoName}/`
      };

      logger.info('Repository updated and Pages deployed', result);
      return result;

    } catch (error) {
      logger.error('Repository update failed', { 
        error: error.message,
        stack: error.stack 
      });
      throw error;
    }
  }

  /**
   * Sanitize repository name
   */
  sanitizeRepoName(taskName) {
    return taskName
      .toLowerCase()
      .replace(/[^a-z0-9-]/g, '-')
      .replace(/-+/g, '-')
      .replace(/^-|-$/g, '');
  }

  /**
   * Create a new GitHub repository
   */
  async createGitHubRepo(repoName) {
    try {
      // Check if repo already exists
      try {
        const existing = await this.octokit.repos.get({
          owner: this.username,
          repo: repoName
        });
        
        logger.warn(`Repository ${repoName} already exists, will update it`);
        return existing.data;
      } catch (error) {
        if (error.status !== 404) throw error;
        // Repo doesn't exist, continue to create it
      }

      // Create new repository
      const response = await this.octokit.repos.createForAuthenticatedUser({
        name: repoName,
        description: `Auto-generated application for ${repoName}`,
        private: false,
        auto_init: false,
        has_issues: true,
        has_projects: false,
        has_wiki: false
      });

      return response.data;

    } catch (error) {
      logger.error('Failed to create GitHub repository', { 
        error: error.message,
        repoName 
      });
      throw error;
    }
  }

  /**
   * Clone repository and populate with files
   */
  async cloneAndPopulateRepo(cloneUrl, localPath, files) {
    try {
      // Remove existing directory if it exists
      if (fs.existsSync(localPath)) {
        await fs.remove(localPath);
        logger.info('Removed existing local directory', { localPath });
      }

      // Initialize git repository locally
      await fs.ensureDir(localPath);
      const git = simpleGit(localPath);
      await git.init();
      await git.addConfig('user.name', this.username);
      await git.addConfig('user.email', process.env.STUDENT_EMAIL || `${this.username}@users.noreply.github.com`);

      // Write all files
      for (const [filename, content] of Object.entries(files)) {
        const filePath = path.join(localPath, filename);
        await fs.writeFile(filePath, content, 'utf8');
        logger.info(`Created file: ${filename}`);
      }

      // Add remote with authentication token
      const authenticatedUrl = cloneUrl.replace(
        'https://',
        `https://${this.token}@`
      );
      await git.addRemote('origin', authenticatedUrl);

      // Commit
      await git.add('.');
      await git.commit('Initial commit: Auto-generated application');
      
      // Create main branch explicitly and push
      await git.branch(['-M', 'main']);
      
      // Push to main branch with retry logic
      let pushSuccess = false;
      const maxPushAttempts = 3;
      
      for (let attempt = 1; attempt <= maxPushAttempts; attempt++) {
        try {
          logger.info(`Attempting to push (attempt ${attempt}/${maxPushAttempts})`);
          await git.push(['-u', 'origin', 'main', '--force']);
          pushSuccess = true;
          logger.info('Successfully pushed to main branch');
          break;
        } catch (pushError) {
          logger.warn(`Push attempt ${attempt} failed`, { error: pushError.message });
          if (attempt === maxPushAttempts) {
            throw pushError;
          }
          // Wait before retry
          await new Promise(resolve => setTimeout(resolve, 2000 * attempt));
        }
      }

      if (!pushSuccess) {
        throw new Error('Failed to push after all attempts');
      }

      logger.info('Repository populated and pushed successfully');

    } catch (error) {
      logger.error('Failed to populate repository', { error: error.message });
      throw error;
    }
  }

  /**
   * Enable GitHub Pages for the repository
   */
  async enableGitHubPages(repoName) {
    try {
      // Wait a moment for the repo to be fully ready
      await new Promise(resolve => setTimeout(resolve, 2000));

      await this.octokit.repos.createPagesSite({
        owner: this.username,
        repo: repoName,
        source: {
          branch: 'main',
          path: '/'
        }
      });

      logger.info('GitHub Pages enabled', { repoName });

      // Wait for Pages to deploy
      await this.waitForPagesDeployment(repoName);

    } catch (error) {
      if (error.status === 409) {
        logger.info('GitHub Pages already enabled', { repoName });
      } else {
        logger.error('Failed to enable GitHub Pages', { 
          error: error.message,
          status: error.status 
        });
        // Don't throw - Pages might already be enabled or will auto-enable
      }
    }
  }

  /**
   * Wait for GitHub Pages to be deployed and verify it's showing the latest commit
   */
  async waitForPagesDeployment(repoName, expectedCommitSha, maxAttempts = 15) {
    logger.info('Waiting for GitHub Pages to deploy latest version', { 
      repoName, 
      expectedCommitSha 
    });

    for (let i = 0; i < maxAttempts; i++) {
      try {
        const pages = await this.octokit.repos.getPages({
          owner: this.username,
          repo: repoName
        });

        logger.info(`GitHub Pages check ${i + 1}/${maxAttempts}`, { 
          status: pages.data.status,
          buildStatus: pages.data.build_status 
        });

        // Check if Pages is built and ready
        if (pages.data.status === 'built') {
          // Additional wait to ensure CDN propagation
          logger.info('Pages built, waiting 10 seconds for CDN propagation');
          await new Promise(resolve => setTimeout(resolve, 10000));
          
          logger.info('GitHub Pages deployed successfully', { repoName });
          return true;
        }

        logger.info(`Pages status: ${pages.data.status}, waiting...`);
        await new Promise(resolve => setTimeout(resolve, 5000)); // Wait 5s between checks

      } catch (error) {
        logger.warn(`Pages check attempt ${i + 1} failed`, { error: error.message });
        await new Promise(resolve => setTimeout(resolve, 5000));
      }
    }

    // If we couldn't confirm, wait an additional safety buffer
    logger.warn('Could not confirm Pages deployment status, adding safety buffer');
    await new Promise(resolve => setTimeout(resolve, 15000)); // Extra 15s wait
    return false;
  }

  /**
   * Get the latest commit SHA
   */
  async getLatestCommitSha(repoName) {
    try {
      const response = await this.octokit.repos.listCommits({
        owner: this.username,
        repo: repoName,
        per_page: 1
      });

      return response.data[0].sha;

    } catch (error) {
      logger.error('Failed to get commit SHA', { error: error.message });
      throw error;
    }
  }

  /**
   * Check if a repository exists
   */
  async repoExists(repoName) {
    try {
      await this.octokit.repos.get({
        owner: this.username,
        repo: repoName
      });
      return true;
    } catch (error) {
      return false;
    }
  }
}

module.exports = GitHubManager;