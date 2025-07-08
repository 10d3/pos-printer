const { app, BrowserWindow } = require("electron");
const path = require("path");
const { ipcMain } = require("electron");
const fs = require("fs");
const configPath = path.resolve(__dirname, "../config.json");

function createWindow() {
  const win = new BrowserWindow({
    width: 500,
    height: 400,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false, // For simplicity; we can improve security later
    },
  });

  win.loadFile(path.join(__dirname, "renderer.html"));
}

app.whenReady().then(createWindow);

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") app.quit();
});

ipcMain.handle("get-config", async () => {
  try {
    const data = fs.readFileSync(configPath, "utf-8");
    return JSON.parse(data);
  } catch (error) {
    return { error: error.message };
  }
});

ipcMain.handle("save-config", async (event, config) => {
  try {
    fs.writeFileSync(configPath, JSON.stringify(config, null, 2));
    return { success: true };
  } catch (error) {
    return { error: error.message };
  }
});

ipcMain.handle("find-printers", async () => {
  try {
    const escpos = require("escpos");
    escpos.USB = require("escpos-usb");
    const devices = escpos.USB.findPrinter();
    if (!devices.length) {
      return [];
    }
    return devices.map((device) => {
      const desc = device.deviceDescriptor;
      return {
        idVendor: desc.idVendor,
        idProduct: desc.idProduct,
      };
    });
  } catch (err) {
    return { error: err.message };
  }
});
