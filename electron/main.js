import { app, BrowserWindow, Tray, Menu, dialog, shell } from 'electron';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { spawn } from 'child_process';
import fs from 'fs';
import tcpPortUsed from 'tcp-port-used';
import kill from 'kill-port';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Initialize Logger
class Logger {
  constructor() {
    this.logDir = join(app.getPath('userData'), 'logs');
    this.logFile = join(this.logDir, `app-${new Date().toISOString().split('T')[0]}.log`);
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
    
    console[level === 'error' ? 'error' : 'log'](logMessage);
    
    try {
      fs.appendFileSync(this.logFile, logMessage + '\n');
    } catch (error) {
      console.error('Failed to write to log file:', error);
    }
  }

  info(source, message, ...args) { this.log('info', source, message, ...args); }
  error(source, message, ...args) { this.log('error', source, message, ...args); }
  warn(source, message, ...args) { this.log('warn', source, message, ...args); }
  getLogFilePath() { return this.logFile; }
}

// Initialize logger
const logger = new Logger();

// Environment detection
const isDevelopment = !app.isPackaged;
const NEXT_PORT = 3000;
const NEST_PORT = 3030;

// Global variables
let tray = null;
let win = null;
let nestProcess = null;
let nextProcess = null;

// Path resolution
function getProjectRoot() {
  if (isDevelopment) {
    return join(__dirname, '..');
  } else {
    return process.resourcesPath;
  }
}

function getServerPaths() {
  const projectRoot = getProjectRoot();
  
  if (isDevelopment) {
    return {
      nextServerPath: join(projectRoot, 'service-portal-ui'),
      nestServerPath: join(projectRoot, 'technician-app')
    };
  } else {
    const paths = {
      nextServerPath: join(projectRoot, 'packaged-servers', 'next-server', 'server.js'),
      nestServerPath: join(projectRoot, 'packaged-servers', 'nest-server', 'technician-app.exe')
    };
    
    logger.info('MAIN', 'Production paths:', JSON.stringify(paths));
    return paths;
  }
}

function showError(title, message) {
  logger.error('MAIN', title, message);
  if (!isDevelopment) {
    dialog.showErrorBox(title, message);
  }
}

async function killPort(port) {
  try {
    await kill(port);
    logger.info('MAIN', `✅ Killed process on port ${port}`);
  } catch (err) {
    logger.warn('MAIN', `⚠️ No process running on port ${port}`);
  }
}

async function waitForPort(port, timeout = 60000) {
  const start = Date.now();
  while (!(await tcpPortUsed.check(port))) {
    if (Date.now() - start > timeout) {
      throw new Error(`Timeout waiting for port ${port}`);
    }
    logger.info('MAIN', `⏳ Waiting for port ${port}...`);
    await new Promise((res) => setTimeout(res, 1000));
  }
  logger.info('MAIN', `✅ Port ${port} is ready`);
}

// Global variables to track process termination
let isShuttingDown = false;

// Enhanced cleanup with better process killing
async function cleanup() {
  if (isShuttingDown) return;
  isShuttingDown = true;
  
  logger.info('MAIN', '🧹 Starting cleanup processes...');
  
  // Kill processes more aggressively
  const killPromises = [];
  
  if (nestProcess && !nestProcess.killed) {
    killPromises.push(new Promise((resolve) => {
      logger.info('MAIN', `🔪 Terminating NestJS process PID: ${nestProcess.pid}`);
      
      nestProcess.kill('SIGINT'); // Try graceful shutdown first
      
      setTimeout(() => {
        if (nestProcess && !nestProcess.killed) {
          logger.warn('MAIN', `⚠️ Force killing NestJS process PID: ${nestProcess.pid}`);
          nestProcess.kill('SIGKILL'); // Force kill if still running
        }
        resolve();
      }, 3000);
    }));
  }
  
  if (nextProcess && !nextProcess.killed) {
    killPromises.push(new Promise((resolve) => {
      logger.info('MAIN', `🔪 Terminating Next.js process PID: ${nextProcess.pid}`);
      
      nextProcess.kill('SIGINT');
      
      setTimeout(() => {
        if (nextProcess && !nextProcess.killed) {
          logger.warn('MAIN', `⚠️ Force killing Next.js process PID: ${nextProcess.pid}`);
          nextProcess.kill('SIGKILL');
        }
        resolve();
      }, 3000);
    }));
  }
  
  // Wait for all processes to be killed
  await Promise.all(killPromises);
  
  // Additional port cleanup as backup
  try {
    logger.info('MAIN', '🔌 Cleaning up ports...');
    await killPort(NEST_PORT);
    await killPort(NEXT_PORT);
  } catch (error) {
    logger.warn('MAIN', 'Port cleanup failed:', error.message);
  }
  
  logger.info('MAIN', '✅ Cleanup completed');
}

// Enhanced Next.js server startup with detailed logging
async function startNextServer() {
  logger.info('NEXTJS', `🚀 Starting Next.js server in ${isDevelopment ? 'development' : 'production'} mode...`);
  
  try {
    await killPort(NEXT_PORT);
    
    const { nextServerPath } = getServerPaths();
    logger.info('NEXTJS', `📂 Next.js server path: ${nextServerPath}`);
    
    if (!fs.existsSync(nextServerPath)) {
      const error = `Next.js server not found at ${nextServerPath}`;
      logger.error('NEXTJS', 'Server file missing:', error);
      showError('Next.js Server Error', error);
      throw new Error(error);
    }
    
    if (isDevelopment) {
      const isWindows = process.platform === 'win32';
      nextProcess = spawn(isWindows ? 'npm.cmd' : 'npm', ['run', 'dev'], {
        cwd: nextServerPath,
        env: {
          ...process.env,
          PORT: NEXT_PORT.toString(),
          NODE_ENV: 'development'
        },
        stdio: ['pipe', 'pipe', 'pipe'],
        shell: true
      });
    } else {
      // FIXED: Use Node.js executable, not Electron executable
      const nodeExecutable = process.platform === 'win32' ? 'node.exe' : 'node';
      
      nextProcess = spawn(nodeExecutable, [nextServerPath], {
        env: {
          ...process.env,
          PORT: NEXT_PORT.toString(),
          NODE_ENV: 'production'
        },
        stdio: ['pipe', 'pipe', 'pipe']
      });
    }
    
    // ... rest of your event handlers remain the same
  } catch (error) {
    logger.error('NEXTJS', 'Failed to start Next.js server:', error.message);
    throw error;
  }
}


// Enhanced NestJS server startup with detailed logging
async function startNestServer() {
  logger.info('NESTJS', `🚀 Starting NestJS server in ${isDevelopment ? 'development' : 'production'} mode...`);
  
  try {
    await killPort(NEST_PORT);
    
    const { nestServerPath } = getServerPaths();
    logger.info('NESTJS', `📂 NestJS server path: ${nestServerPath}`);
    
    if (!fs.existsSync(nestServerPath)) {
      const error = `NestJS server not found at ${nestServerPath}`;
      logger.error('NESTJS', 'Server file missing:', error);
      showError('NestJS Server Error', error);
      throw new Error(error);
    }

    // Create database directory in user data folder
    const userDataPath = app.getPath('userData');
    const databaseDir = join(userDataPath, 'database');
    const databasePath = join(databaseDir, 'app.db');
    
    // Ensure database directory exists
    if (!fs.existsSync(databaseDir)) {
      fs.mkdirSync(databaseDir, { recursive: true });
      logger.info('NESTJS', `📁 Created database directory: ${databaseDir}`);
    }
    
    logger.info('NESTJS', `🗄️ Database path: ${databasePath}`);
    
    logger.info('NESTJS', '✅ Server file exists, starting process...');
    
    if (isDevelopment) {
      const isWindows = process.platform === 'win32';
      logger.info('NESTJS', `Starting development server with ${isWindows ? 'npm.cmd' : 'npm'}`);
      
      // nestProcess = spawn(isWindows ? 'npm.cmd' : 'npm', ['run', 'start:dev'], {
      //   cwd: nestServerPath,
      //   env: {
      //     ...process.env,
      //     PORT: NEST_PORT.toString(),
      //     NODE_ENV: 'development'
      //   },
      //   stdio: ['pipe', 'pipe', 'pipe'],
      //   shell: true
      // });
        const nestMainPath = join(dirname(nestServerPath), 'main.js');
  const nodeExecutable = process.platform === 'win32' ? 'node.exe' : 'node';
  
  nestProcess = spawn(nodeExecutable, [nestMainPath], {
    env: {
      ...process.env,
      PORT: NEST_PORT.toString(),
      NODE_ENV: 'production',
      DATABASE_PATH: databasePath
    },
    stdio: ['pipe', 'pipe', 'pipe']
  });
    } else {
      logger.info('NESTJS', `Starting production executable: ${nestServerPath}`);
      
      //! commented for now
      nestProcess = spawn(nestServerPath, [], {
        env: {
          ...process.env,
          PORT: NEST_PORT.toString(),
          NODE_ENV: 'production',
          DATABASE_PATH: databasePath,  //! chenged nw
          USER_DATA_PATH: userDataPath  //! changed new
        },
        stdio: ['pipe', 'pipe', 'pipe']
      });
    }

      // Add process monitoring

      setTimeout(() => {

        if (nestProcess && !nestProcess.killed) {

          logger.info('NESTJS', `Process still running after 5 seconds, PID: ${nestProcess.pid}`);

        } else {

          logger.error('NESTJS', 'Process died within 5 seconds');

        }

      }, 5000);
    
    // Enhanced process event handling with detailed logging
    nestProcess.stdout.on('data', (data) => {
      const output = data.toString().trim();
      if (output) {
        logger.info('NESTJS', `STDOUT: ${output}`);
      }
    });
    
    nestProcess.stderr.on('data', (data) => {
      const output = data.toString().trim();
      if (output) {
        logger.error('NESTJS', `STDERR: ${output}`);
      }
    });
    
    nestProcess.on('close', (code, signal) => {
      logger.info('NESTJS', `Process closed with code ${code}, signal: ${signal}`);
    });
    
     nestProcess.on('exit', (code, signal) => {

      logger.error('NESTJS', `Process exited unexpectedly with code ${code}, signal: ${signal}`);

    });
    
    nestProcess.on('error', (err) => {
      logger.error('NESTJS', 'Process spawn error:', err.message);
      logger.error('NESTJS', 'Error details:', JSON.stringify(err));
      showError('NestJS Process Error', `Failed to start NestJS server: ${err.message}`);
    });
    
    logger.info('NESTJS', '✅ Process started successfully');
    
  } catch (error) {
    logger.error('NESTJS', 'Failed to start NestJS server:', error.message);
    logger.error('NESTJS', 'Error stack:', error.stack);
    throw error;
  }
}

// Window management
function createWindow() {
  logger.info('MAIN', '🖥️ Creating Electron window...');
  
  win = new BrowserWindow({
    show: false,
    width: 1200,
    height: 800,
    webPreferences: {
      webSecurity: false,
      nodeIntegration: false,
      contextIsolation: true,
    },
  });

  win.webContents.setWindowOpenHandler(({ url }) => {
  // If it's a WhatsApp link, open it with the system default handler
  if (url.startsWith('https://wa.me/') || url.includes('whatsapp')) {
    // Try WhatsApp protocol first
    const phone = url.match(/\d+/)[0];
    const message = url.split('text=')[1];
    const whatsappProtocol = `whatsapp://send?phone=${phone}&text=${message}`;

     // Try desktop app first, fallback to browser
    shell.openExternal(whatsappProtocol).catch(() => {
      shell.openExternal(url); // Fallback to wa.me
    });
    //shell.openExternal(url);
    return { action: 'deny' }; // Prevent opening new window
  }
  
  // For other URLs, you can choose to allow or deny
  return { action: 'allow' };
});
  
  win.maximize();
  win.show();
  
  win.loadURL(`http://localhost:${NEXT_PORT}`);
  
  if (isDevelopment) {
    win.webContents.openDevTools();
  }
  
  win.on('closed', () => {
    win = null;
  });
}

function createSystemTray() {
  const iconPath = join(__dirname, 'public', 'images', 'icon.png');
  
  if (fs.existsSync(iconPath)) {
    tray = new Tray(iconPath);
    const contextMenu = Menu.buildFromTemplate([
      { 
        label: 'Open App', 
        click: () => {
          if (win) {
            win.show();
            win.focus();
          } else {
            createWindow();
          }
        }
      },
      { 
        label: 'View Logs', 
        click: () => {
          const { shell } = require('electron');
          shell.showItemInFolder(logger.getLogFilePath());
        }
      },
      { label: 'Quit', click: () => app.quit() }
    ]);
    
    tray.setToolTip('Service Portal');
    tray.setContextMenu(contextMenu);
    
    tray.on('double-click', () => {
      if (win) {
        win.show();
        win.focus();
      }
    });
  } else {
    logger.warn('MAIN', '⚠️ Tray icon not found at:', iconPath);
  }
}

// function cleanup() {
//   logger.info('MAIN', '🧹 Cleaning up processes...');
  
//   if (nestProcess) {
//     nestProcess.kill('SIGTERM');
//     setTimeout(() => {
//       if (nestProcess && !nestProcess.killed) {
//         nestProcess.kill('SIGKILL');
//       }
//     }, 5000);
//   }
  
//   if (nextProcess) {
//     nextProcess.kill('SIGTERM');
//     setTimeout(() => {
//       if (nextProcess && !nextProcess.killed) {
//         nextProcess.kill('SIGKILL');
//       }
//     }, 5000);
//   }
  
//   setTimeout(async () => {
//     await killPort(NEXT_PORT);
//     await killPort(NEST_PORT);
//   }, 1000);
// }

async function checkPortsBeforeStart() {
  logger.info('MAIN', '🔍 Checking ports before startup...');
  
  // Check if ports are already in use
  const nestPortInUse = await tcpPortUsed.check(NEST_PORT); //!uncomment
  const nextPortInUse = await tcpPortUsed.check(NEXT_PORT);
  
  if (nestPortInUse) {
    logger.warn('MAIN', `⚠️ Port ${NEST_PORT} is already in use, attempting to free it...`);
    await killPort(NEST_PORT);
    
    // Wait a bit and check again
    await new Promise(resolve => setTimeout(resolve, 2000));
    const stillInUse = await tcpPortUsed.check(NEST_PORT);
    if (stillInUse) {
      throw new Error(`Port ${NEST_PORT} is still in use after cleanup attempt`);
    }
  }
  
  if (nextPortInUse) {
    logger.warn('MAIN', `⚠️ Port ${NEXT_PORT} is already in use, attempting to free it...`);
    await killPort(NEXT_PORT);
    
    await new Promise(resolve => setTimeout(resolve, 2000));
    const stillInUse = await tcpPortUsed.check(NEXT_PORT);
    if (stillInUse) {
      throw new Error(`Port ${NEXT_PORT} is still in use after cleanup attempt`);
    }
  }
  
  logger.info('MAIN', '✅ Ports are free and ready');
}

async function startApplication() {
  try {
    logger.info('MAIN', `🎯 Starting application in ${isDevelopment ? 'DEVELOPMENT' : 'PRODUCTION'} mode`);
    logger.info('MAIN', `📁 Project root: ${getProjectRoot()}`);
    logger.info('MAIN', `📦 App packaged: ${app.isPackaged}`);
    logger.info('MAIN', `📄 Log file: ${logger.getLogFilePath()}`);
    
    const paths = getServerPaths();
    logger.info('MAIN', `📂 Next.js path: ${paths.nextServerPath}`);
    logger.info('MAIN', `📂 NestJS path: ${paths.nestServerPath}`);

     // Check ports before starting
    await checkPortsBeforeStart();
    
    createSystemTray();
    
    logger.info('MAIN', '⚡ Starting servers...');
    await startNestServer(); //!uncomment
    await startNextServer();
    
    logger.info('MAIN', '⏳ Waiting for servers to start...');
    await waitForPort(NEST_PORT, 30000); //!uncomment
    await waitForPort(NEXT_PORT, 60000);
    
    logger.info('MAIN', '✅ All servers are ready!');
    
    createWindow();
    
  } catch (error) {
    logger.error('MAIN', '❌ Failed to start application:', error.message);
    logger.error('MAIN', 'Error stack:', error.stack);
    showError('Startup Error', `Failed to start application: ${error.message}`);
    app.quit();
  }
}

// App events
app.whenReady().then(startApplication);

app.on('window-all-closed', async () => {
  logger.info('MAIN', '🪟 All windows closed');
  if (process.platform !== 'darwin') {
    await cleanup();
    app.quit();
  }
});

app.on('before-quit', async (event) => {
  logger.info('MAIN', '🛑 App is quitting...');
  if (!isShuttingDown) {
    event.preventDefault(); // Prevent quit until cleanup is done
    await cleanup();
    app.quit();
  }
});

app.on('will-quit', async (event) => {
  logger.info('MAIN', '🛑 App will quit...');
  if (!isShuttingDown) {
    event.preventDefault();
    await cleanup();
    app.quit();
  }
});

// Handle unexpected exits
process.on('SIGINT', async () => {
  logger.info('MAIN', '🛑 Received SIGINT');
  await cleanup();
  process.exit(0);
});

process.on('SIGTERM', async () => {
  logger.info('MAIN', '🛑 Received SIGTERM');
  await cleanup();
  process.exit(0);
});

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});
// Global error handling
process.on('unhandledRejection', (error) => {
  logger.error('MAIN', 'Unhandled promise rejection:', error.message);
  logger.error('MAIN', 'Rejection stack:', error.stack);
  showError('Unhandled Error', error.message);
});

process.on('uncaughtException', (error) => {
  logger.error('MAIN', 'Uncaught exception:', error.message);
  logger.error('MAIN', 'Exception stack:', error.stack);
  showError('Critical Error', error.message);
  cleanup();
  app.quit();
});

logger.info('MAIN', `🚀 Electron app starting in ${isDevelopment ? 'DEVELOPMENT' : 'PRODUCTION'} mode`);
