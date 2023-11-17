
const electron = require('electron');
const app = electron.app;
const ipcMain = electron.ipcMain;
const BrowserWindow = electron.BrowserWindow;
const path = require('path');
const isDev = require('electron-is-dev');

let mainWindow;

// check online status
async function checkOnlineStatus() {
  const isOnline = await import('is-online');
  return isOnline.default();
}

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 800,
    height: 600,
    icon: path.join(__dirname, '../assets/favicon.ico'),
    webPreferences: {
      nodeIntegration: true,
      preload: path.join(__dirname, 'preload.js')
    }
  });
  mainWindow.loadURL(isDev ? 'http://localhost:3001' : `https://timerapp-ddb0e.web.app/`).catch(() => {
    mainWindow.loadFile('public/offline.html');
  });
  mainWindow.on('closed', () => mainWindow = null);
  mainWindow.setMenuBarVisibility(false);
  mainWindow.on('close', () => {
    mainWindow.focus();
  });
}

ipcMain.on('reload-app', () => {
  checkOnlineStatus().then(online => {
    if (online) {
      mainWindow.loadURL(isDev ? 'http://localhost:3001' : `https://timerapp-ddb0e.web.app/`).catch(() => {
        mainWindow.loadFile('public/offline.html');
      });
    }else{
      mainWindow.loadFile('public/offline.html');
    }
  });
});

app.on('ready', createWindow);

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  if (mainWindow === null) {
    createWindow();
  }
});