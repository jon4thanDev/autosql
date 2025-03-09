const { contextBridge, ipcRenderer } = require("electron");

contextBridge.exposeInMainWorld("electronAPI", {
  isElectron: true,
  getDiskSpace: (drive) => ipcRenderer.invoke("get-disk-space", drive),
  openPath: (path) => ipcRenderer.send("open-path", path),
  getLocalIP: () => ipcRenderer.invoke("get-local-ip"),
});
