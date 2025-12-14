const { app, BrowserWindow, Menu } = require('electron');
const path = require('path');

// Hot reload для разработки
try {
  require('electron-reloader')(module, {
    debug: true,
    watchRenderer: true
  });
} catch {}

// Handle creating/removing shortcuts on Windows when installing/uninstalling.
if (require('electron-squirrel-startup')) {
  app.quit();
}

let mainWindow;

const createWindow = () => {
  mainWindow = new BrowserWindow({
    width: 1280,
    height: 800,
    title: "OpenMinecraft",
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false,
      enableRemoteModule: true
    }
  });

  // В режиме разработки открываем DevTools
  if (process.env.NODE_ENV === 'development') {
    mainWindow.webContents.openDevTools();
  }

  // Загружаем index.html
  mainWindow.loadFile(path.join(__dirname, 'index.html'));
  
  // Убираем меню
  Menu.setApplicationMenu(null);

  mainWindow.on('closed', () => {
    mainWindow = null;
  });
};

app.whenReady().then(() => {
  createWindow();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

// Update electron app
app.on('ready', () => {
  try {
    const { updateElectronApp } = require('update-electron-app');
    updateElectronApp();
  } catch (error) {
    console.log('Update electron app error:', error);
  }
});