const { ipcMain } = require("electron");
const checkDiskSpace = require("check-disk-space").default;

ipcMain.handle("get-disk-space", async (_event, drive) => {
  try {
    const { free, size } = await checkDiskSpace(drive);
    const usedPercentage = ((size - free) / size) * 100;
    return Math.round(usedPercentage);
  } catch (error) {
    console.error("Error getting drive space:", error);
    throw error;
  }
});
