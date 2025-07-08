const Service = require("node-windows").Service;

const svc = new Service({
  name: "POS Printer Server",
  script: "C:\\Program Files\\POSPrinterServer\\pos-server.exe",
});

svc.on("uninstall", () => {
  console.log("Service uninstalled!");
});

svc.uninstall();
