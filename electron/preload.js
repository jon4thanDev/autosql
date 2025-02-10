const { contextBridge, ipcRenderer } = require("electron");

contextBridge.exposeInMainWorld("electronAPI", {
  getDiskSpace: (drive) => ipcRenderer.invoke("get-disk-space", drive),
});
