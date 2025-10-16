const fs = require('fs');
const path = require('path');

// Ensure logs directory exists
const logsDir = path.join(__dirname, '../../logs');
if (!fs.existsSync(logsDir)) {
  fs.mkdirSync(logsDir, { recursive: true });
}

const logLevels = {
  error: 0,
  warn: 1,
  info: 2,
  debug: 3
};

class Logger {
  constructor() {
    this.logLevel = process.env.LOG_LEVEL || 'info';
    this.logFile = path.join(logsDir, `app-${this.getDateString()}.log`);
  }

  getDateString() {
    const now = new Date();
    return now.toISOString().split('T')[0];
  }

  getTimestamp() {
    return new Date().toISOString();
  }

  formatMessage(level, message, data = null) {
    const timestamp = this.getTimestamp();
    let logMessage = `[${timestamp}] [${level.toUpperCase()}] ${message}`;
    
    if (data) {
      logMessage += `\n${JSON.stringify(data, null, 2)}`;
    }
    
    return logMessage;
  }

  writeToFile(message) {
    try {
      fs.appendFileSync(this.logFile, message + '\n');
    } catch (error) {
      console.error('Failed to write to log file:', error);
    }
  }

  log(level, message, data = null) {
    if (logLevels[level] <= logLevels[this.logLevel]) {
      const formattedMessage = this.formatMessage(level, message, data);
      
      // Console output with colors
      if (level === 'error') {
        console.error('\x1b[31m%s\x1b[0m', formattedMessage);
      } else if (level === 'warn') {
        console.warn('\x1b[33m%s\x1b[0m', formattedMessage);
      } else if (level === 'info') {
        console.info('\x1b[36m%s\x1b[0m', formattedMessage);
      } else {
        console.log(formattedMessage);
      }
      
      // Write to file
      this.writeToFile(formattedMessage);
    }
  }

  error(message, data = null) {
    this.log('error', message, data);
  }

  warn(message, data = null) {
    this.log('warn', message, data);
  }

  info(message, data = null) {
    this.log('info', message, data);
  }

  debug(message, data = null) {
    this.log('debug', message, data);
  }
}

// Export singleton instance
module.exports = new Logger();