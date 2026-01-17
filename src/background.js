const { app, BrowserWindow, ipcMain } = require('electron');
const path = require('path');
const ping = require('ping');
const nodemailer = require('nodemailer');
const {autoUpdater} = require('electron-updater')
const isDev = process.env.NODE_ENV !== 'production';
// const { MongoClient } = require("mongodb");
// const mongoURI = "mongodb+srv://atlas-sample-dataset-load-67e408f004ae7a42fc68a7f8:qhSbqwBNBKdo149v@nd.xkuhzrx.mongodb.net/?retryWrites=true&w=majority&appName=nd";
// const client = new MongoClient(mongoURI);
// let db;
const transporter = require("./smtpTransporter");
function createWindow() {
  const win = new BrowserWindow({
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

// ipcMain.handle("fetch-data", async (event, collectionName) => {
//   try {
//     const collection = db.collection(collectionName);
//     return await collection.find({}).toArray();
//   } catch (err) {
//     console.error("Error fetching data:", err);
//     throw err;
//   }
// });

// ipcMain.handle("insert-data", async (event, collectionName, data) => {
//   try {
//     const collection = db.collection(collectionName);
//     return await collection.insertOne(data);
//   } catch (err) {
//     console.error("Error inserting data:", err);
//     throw err;
//   }
// });

app.whenReady().then(async () => {
  createWindow();
  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
  // try {
  //   await client.connect(); // Connect to MongoDB
  //   db = client.db("networkdash"); // Access the database
  //   console.log("Connected to MongoDB");
  // } catch (err) {
  //   console.error("MongoDB connection error:", err);
  // }
  if(!isDev){
    globalShortcut.register('Control+Shift+I', () => {
      return false; 
  });
  }
  autoUpdater.on('update-available', () => {
    log.
    win.webContents.send('update-available');
  });

  autoUpdater.on('update-downloaded', () => {
    console.log('Update downloaded!');
    win.webContents.send('update-downloaded');
  });
});

app.on('before-quit', () => {
  autoUpdater.quitAndInstall(false, true)
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});