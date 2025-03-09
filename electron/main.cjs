const { app, BrowserWindow, ipcMain, shell } = require("electron");
const path = require("path");
const os = require("os");
const { exec } = require("child_process");

require("./diskSpace.cjs");

let mainWindow = null;
let backendProcess = null;

const getLocalIP = () => {
  const interfaces = os.networkInterfaces();
  for (const key in interfaces) {
    for (const net of interfaces[key] || []) {
      if (net.family === "IPv4" && !net.internal) {
        return net.address;
      }
    }
  }
  return "127.0.0.1"; // Fallback
};

app.whenReady().then(() => {
  startBackend(); // Start the backend server

  mainWindow = new BrowserWindow({
    width: 1920,
    height: 1080,
    frame: true,
    autoHideMenuBar: true,
    webPreferences: {
      preload: path.join(__dirname, "preload.js"),
      nodeIntegration: false,
      contextIsolation: true,
    },
    icon: path.join(__dirname, "../src/assets/icon.ico"),
  });

  mainWindow.maximize();

  ipcMain.on("open-path", (event, path) => {
    shell.openPath(path);
  });

  ipcMain.handle("get-local-ip", async () => getLocalIP());

  const startUrl = app.isPackaged
    ? `file://${path.join(__dirname, "../dist/index.html")}`
    : "http://localhost:5173";

  mainWindow.loadURL(startUrl);

  app.on("window-all-closed", () => {
    if (process.platform !== "darwin") {
      if (backendProcess) backendProcess.kill(); // Stop backend when closing
      app.quit();
    }
  });
});

function startBackend() {
  const backendPath = path.join(__dirname, "../src/api/server.ts"); // TypeScript backend
  backendProcess = exec(
    `nodemon --exec tsx ${backendPath}`,
    (err, stdout, stderr) => {
      if (err) {
        console.error(`Backend failed to start: ${err.message}`);
        return;
      }
      console.log(`Backend output: ${stdout}`);
    }
  );
}
