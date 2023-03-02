const { app, BrowserWindow, ipcMain } = require('electron');
const path = require('path');
const electronSquirrelStartup = require('electron-squirrel-startup');

// Handle creating/removing shortcuts on Windows when installing/uninstalling.
if (electronSquirrelStartup) {
  app.quit();
}

const prepareDirectus = () => {
  // eslint-disable-next-line global-require
  const config = require('dotenv').config({ path: path.resolve(__dirname, '../.env') });
  if (config.parsed.DB_FILENAME) process.env.DB_FILENAME = path.resolve(__dirname, '../', config.parsed.DB_FILENAME);
  if (config.parsed.EXTENSIONS_PATH) process.env.EXTENSIONS_PATH = path.resolve(__dirname, '../', config.parsed.EXTENSIONS_PATH);
  if (config.parsed.STORAGE_LOCAL_ROOT) process.env.STORAGE_LOCAL_ROOT = path.resolve(__dirname, '../', config.parsed.STORAGE_LOCAL_ROOT);
  if (config.parsed.PACKAGE_FILE_LOCATION) process.env.PACKAGE_FILE_LOCATION = path.resolve(__dirname, '../', config.parsed.PACKAGE_FILE_LOCATION);
  if (app.isPackaged) process.env.LOG_LEVEL = 'silent';

  // eslint-disable-next-line import/no-unresolved, global-require
  return require('directus/server');
};

const createWindow = async () => {
  let isMainWindowVisible = false;
  const handleHideSplashScreen = (splashScreen, mainWindow) => {
    if (!isMainWindowVisible) {
      isMainWindowVisible = true;
      return;
    }
    splashScreen.close();
    mainWindow.show();
    mainWindow.focus();
  };

  const mainWindow = new BrowserWindow({
    width: 800,
    height: 600,
    show: false,
  });

  const splashScreen = new BrowserWindow({
    width: 480,
    height: 270,
    transparent: true,
    frame: false,
    alwaysOnTop: true,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      nodeIntegration: true,
    },
  });
  ipcMain.handle('onSplashEnded', () => {
    handleHideSplashScreen(splashScreen, mainWindow);
  });
  mainWindow.once('ready-to-show', () => {
    handleHideSplashScreen(splashScreen, mainWindow);
  });

  splashScreen.loadFile(path.join(__dirname, 'splash.html'));
  await prepareDirectus().startServer();
  mainWindow.loadURL('http://localhost:8055');

  if (!app.isPackaged) mainWindow.webContents.openDevTools();
};

app.whenReady().then(async () => {
  createWindow();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});
