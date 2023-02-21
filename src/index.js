const { app, BrowserWindow } = require('electron');
const path = require('path');

const config = require('dotenv').config({ path: path.resolve(__dirname, '../.env') });
if (config.parsed.DB_FILENAME) {
  process.env.DB_FILENAME = path.resolve(__dirname, '../', config.parsed.DB_FILENAME);
}
if (config.parsed.EXTENSIONS_PATH) {
  process.env.EXTENSIONS_PATH = path.resolve(__dirname, '../', config.parsed.EXTENSIONS_PATH);
}
if (config.parsed.STORAGE_LOCAL_ROOT) {
  process.env.STORAGE_LOCAL_ROOT = path.resolve(__dirname, '../', config.parsed.STORAGE_LOCAL_ROOT);
}
if (config.parsed.PACKAGE_FILE_LOCATION) {
  process.env.PACKAGE_FILE_LOCATION = path.resolve(__dirname, '../', config.parsed.PACKAGE_FILE_LOCATION);
}

const directus = require("directus/server");
// Handle creating/removing shortcuts on Windows when installing/uninstalling.
if (require('electron-squirrel-startup')) {
  app.quit();
}

const createWindow = () => {
  // Create the browser window.
  const mainWindow = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
      preload: path.join(__dirname, "preload.js"),
      nodeIntegration: true
    },
  });

  // and load the index.html of the app.
  // mainWindow.loadFile(path.join(__dirname, 'index.html'));
  mainWindow.loadURL("http://localhost:8055");

  // Open the DevTools.
  mainWindow.webContents.openDevTools();
};

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.whenReady().then(async () => {
  await directus.startServer();
  createWindow();

  app.on("activate", () => {
    // On macOS it's common to re-create a window in the app when the
    // dock icon is clicked and there are no other windows open.
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and import them here.
