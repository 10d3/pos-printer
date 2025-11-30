const Service = require("node-windows").Service;
const path = require("path");

const svc = new Service({
  name: "POS Printer Server",
  description: "POS Printer Server running as a background service",
  script: path.join(__dirname, "server.js"),
  nodeOptions: ["--harmony", "--max_old_space_size=4096"],
  env: {
    name: "NODE_ENV",
    value: "production",
  },
});

svc.on("install", () => {
  console.log("Service installed successfully!");
  svc.start();
});

svc.on("alreadyinstalled", () => {
  console.log("Service is already installed.");
});

svc.on("error", (err) => {
  console.error("Service error:", err);
});

svc.install();
