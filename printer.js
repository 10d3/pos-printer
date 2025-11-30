const fs = require("fs");
const path = require("path");
const { exec } = require("child_process");
const os = require("os");

// Lazy-load escpos modules to avoid crashes on Windows with Bun
let escpos = null;
let escposLoaded = false;

function loadEscpos() {
  if (!escposLoaded) {
    try {
      escpos = require("escpos");
      escpos.USB = require("escpos-usb");
      escpos.Network = require("escpos-network");
      escpos.SerialPort = require("escpos-serialport");
      escposLoaded = true;
    } catch (error) {
      console.error("Failed to load escpos modules:", error.message);
      throw new Error("Printer modules not available");
    }
  }
  return escpos;
}

const config = JSON.parse(
  fs.readFileSync(path.join(__dirname, "config.json"), "utf-8")
);

async function printOrder(payload) {
  const { content, ...order } = payload;

  switch (config.printerType) {
    case "usb": {
      const esc = loadEscpos();
      const usbDevice = new esc.USB(
        config.usb?.idVendor,
        config.usb?.idProduct
      );
      return printEscpos(content, order, usbDevice);
    }
    case "network": {
      if (!config.printerIP) throw new Error("Missing printerIP");
      const esc = loadEscpos();
      return printEscpos(content, order, new esc.Network(config.printerIP));
    }
    case "serial": {
      if (!config.serialPort) throw new Error("Missing serialPort");
      const esc = loadEscpos();
      const serial = new esc.SerialPort(config.serialPort, {
        baudRate: 9600,
      });
      return printEscpos(content, order, serial);
    }
    case "windows": {
      if (!config.printerName) throw new Error("Missing printerName");
      return printWindows(content, order);
    }
    default:
      throw new Error("Unsupported printerType");
  }
}

function printEscpos(content, order, device) {
  return new Promise((resolve, reject) => {
    const esc = loadEscpos();
    const printer = new esc.Printer(device);
    device.open((error) => {
      if (error) return reject(error);

      if (Array.isArray(content) && content.length) {
        content.forEach((item) => {
          switch (item.type) {
            case "text":
              printer.align(item.align || "lt");
              if (item.style === "b") printer.style("b");
              if (item.size) printer.size(...item.size);
              printer.text(item.text);
              break;
            case "line":
              printer.text("---------------------------");
              break;
            case "cut":
              printer.cut();
              break;
          }
        });
      } else {
        printer
          .align("ct")
          .style("b")
          .text(config.businessName || "POS")
          .text(`Order #${order.id}`)
          .text("---------------------------");

        order.items?.forEach((i) => {
          printer.align("lt").style("normal").text(`${i.qty}x ${i.name}`);
        });

        printer
          .text("---------------------------")
          .align("rt")
          .text(`Total: $${order.total?.toFixed(2) || ""}`)
          .cut();
      }

      printer.close(resolve);
    });
  });
}

function printWindows(content, order) {
  const lines = [];

  if (Array.isArray(content)) {
    content.forEach((item) => {
      switch (item.type) {
        case "text":
          lines.push(item.text);
          break;
        case "line":
          lines.push("---------------------------");
          break;
        case "cut":
          lines.push(""); // espace avant coupe
          // lines.push(""); // espace
          // lines.push(""); // espace
          lines.push(""); // aide à bien sortir le papier
          lines.push("\n\n\n");
          break;
      }
    });
  } else {
    // Fallback format if content is not array
    lines.push(order.businessName || config.businessName || "POS");
    lines.push("---------------------------");
    order.items?.forEach((i) =>
      lines.push(`${i.qty}x ${i.name} @ ${i.price?.toFixed(2) || "0.00"}`)
    );
    lines.push("---------------------------");
    lines.push(`Total: $${order.total?.toFixed(2) || "0.00"}`);
    lines.push("");
    lines.push("Merci de votre visite !");
    lines.push(""); // espace avant coupe
    lines.push(""); // espace
    // lines.push(""); // espace
    // lines.push(""); // aide à bien sortir le papier
  }

  const rawText = lines.join("\r\n"); // Use \r\n for Windows printers
  const filePath = path.join(os.tmpdir(), `receipt_${Date.now()}.txt`);
  fs.writeFileSync(filePath, rawText, { encoding: "ascii" });

  // Send file to LPT1 using raw copy command
  exec(`copy /B "${filePath}" LPT1`, (err, stdout, stderr) => {
    if (err) {
      console.error("❌ Failed to print to LPT1:", err);
    } else {
      console.log("✅ Receipt sent to LPT1");
    }
  });
}

module.exports = { printOrder };
