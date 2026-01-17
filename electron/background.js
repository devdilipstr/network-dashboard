const { app, BrowserWindow, ipcMain, globalShortcut } = require('electron');
const path = require('path');
const ping = require('ping');
const {autoUpdater} = require('electron-updater')
const isDev = process.env.NODE_ENV !== 'production';
const transporter = require("./smtpTransporter");
let win;
function createWindow() {
  win = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false,
      devTools:true
    },
    icon: path.join(__dirname,'../public/logo.ico')
  });
  win.title
  
  win.setMenuBarVisibility(false)
 
  win.loadURL(
    isDev
      ? 'http://localhost:8080'
      : `file://${path.join(__dirname, '../dist/index.html')}`
  );
  
}
ipcMain.handle('ping-ip', async (event, ip,packettimeout,packets) => {

  try {
    // Define ping options
    const options = {
      timeout: packettimeout,         // 2-second timeout per attempt
      extra: ['-n', packets]  // Windows: Send 4 packets
    };

    const res = await ping.promise.probe(ip, options);
    return {
      alive: res.alive,
      avg: res.avg === 'unknown' ? 'N/A' : res.avg
    };
  } catch (error) {

    return {
      alive: false,
      avg: 'error',
      error: error.message
    };
  }
});


ipcMain.handle('send-email', async (event, emailOptions) => {
  try {
      await transporter.sendMail(emailOptions)
      return "success"
  } catch (error) {
      return error.message
  }
})

ipcMain.handle('get-app-version', () => {
  return app.getVersion(); // Retrieve the current version of the app
});

ipcMain.handle('logout',()=>{
  if(win){
    win.loadURL(
    isDev
      ? 'http://localhost:8080'
      : `file://${path.join(__dirname, '../dist/index.html')}`);
  }
})

app.whenReady().then(async () => {
  createWindow();
  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
  if(!isDev){
    globalShortcut.register('Control+Shift+I', () => {
      return false; 
    });
  }
  autoUpdater.on('update-available', () => {
    win.webContents.send('update-available'); 
  });

  autoUpdater.on('update-downloaded', () => {
    win.webContents.send('update-downloaded');
    autoUpdater.quitAndInstall();
  });
});

app.on('before-quit', () => {
  autoUpdater.quitAndInstall(false, true)
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});