const Service = require("node-windows").Service;

const svc = new Service({
  name: "POS Printer Server",
  description: "POS Printer Server running as a background service",
  script: "C:\\Program Files\\POSPrinterServer\\pos-server.exe",
  // If you want to pass args, use: script: '...', args: ['--your-arg']
  // If you want to run as a specific user, add: user: { account: 'username', password: 'password' }
});

svc.on("install", () => {
  console.log("Service installed!");
  svc.start();
});

svc.install();
