const { app, BrowserWindow } = require('electron');
const path = require('path');

function createWindow() {
  const win = new BrowserWindow({
    width: 800,
    height: 600,
    icon: path.join(__dirname, 'assets/favicon.ico'),
    webPreferences: {
      nodeIntegration: true,
    },
  });

  win.loadURL('http://localhost:3001'); // URL of your local dev server

  win.setMenuBarVisibility(false);
}

app.whenReady().then(createWindow);
