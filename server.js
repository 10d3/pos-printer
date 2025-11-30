const express = require("express");
const { printOrder } = require("./printer");
const app = express();

app.use(express.json());

// Health check endpoint
app.get("/health", (req, res) => {
  res.json({ status: "ok", timestamp: new Date().toISOString() });
});

app.post("/print", async (req, res) => {
  try {
    await printOrder(req.body);
    res.json({ success: true });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: "Print failed" });
  }
});

const server = app.listen(3000, () => {
  console.log("🖨️ POS Printer Server listening on http://localhost:3000");
});

// Prevent crashes from unhandled errors
process.on("uncaughtException", (error) => {
  console.error("❌ Uncaught Exception:", error);
  // Don't exit, keep server running
});

process.on("unhandledRejection", (reason, promise) => {
  console.error("❌ Unhandled Rejection at:", promise, "reason:", reason);
  // Don't exit, keep server running
});

// Keep the process alive and handle graceful shutdown
process.on("SIGTERM", () => {
  console.log("SIGTERM received, closing server gracefully...");
  server.close(() => {
    console.log("Server closed");
    process.exit(0);
  });
});

process.on("SIGINT", () => {
  console.log("SIGINT received, closing server gracefully...");
  server.close(() => {
    console.log("Server closed");
    process.exit(0);
  });
});
