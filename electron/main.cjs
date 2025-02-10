const { app, BrowserWindow, ipcMain, shell } = require("electron");
const path = require("path");
require("./diskSpace.cjs");

// ...existing code...

let mainWindow = null;

app.whenReady().then(() => {
  mainWindow = new BrowserWindow({
    width: 1000,
    height: 700,
    webPreferences: {
      preload: path.join(__dirname, "preload.js"), // Electron does not execute preload.ts directly—it must be compiled to preload.js
      nodeIntegration: false,
      contextIsolation: true,
    },
  });

  ipcMain.on("open-path", (event, path) => {
    shell.openPath(path);
  });

  const startUrl = app.isPackaged
    ? `file://${path.join(__dirname, "../dist/index.html")}`
    : "http://localhost:5173";

  mainWindow.loadURL(startUrl);

  app.on("window-all-closed", () => {
    if (process.platform !== "darwin") app.quit();
  });
});
