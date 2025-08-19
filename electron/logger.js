import fs from 'fs';
import path from 'path';
import { app } from 'electron';

class Logger {
  constructor() {
    // Create logs directory in user data folder
    this.logDir = path.join(app.getPath('userData'), 'logs');
    this.logFile = path.join(this.logDir, `app-${new Date().toISOString().split('T')[0]}.log`);
    
    // Ensure logs directory exists
    this.ensureLogDirectory();
  }

  ensureLogDirectory() {
    try {
      if (!fs.existsSync(this.logDir)) {
        fs.mkdirSync(this.logDir, { recursive: true });
        console.log(`📁 Created logs directory at: ${this.logDir}`);
      }
    } catch (error) {
      console.error('Failed to create logs directory:', error);
    }
  }

  log(level, source, message, ...args) {
    const timestamp = new Date().toISOString();
    const logMessage = `[${timestamp}] [${level.toUpperCase()}] [${source}] ${message} ${args.join(' ')}`;
    
    // Console output
    console[level === 'error' ? 'error' : 'log'](logMessage);
    
    // File output
    try {
      fs.appendFileSync(this.logFile, logMessage + '\n');
    } catch (error) {
      console.error('Failed to write to log file:', error);
    }
  }

  info(source, message, ...args) {
    this.log('info', source, message, ...args);
  }

  error(source, message, ...args) {
    this.log('error', source, message, ...args);
  }

  warn(source, message, ...args) {
    this.log('warn', source, message, ...args);
  }

  getLogFilePath() {
    return this.logFile;
  }
}

export default Logger;
