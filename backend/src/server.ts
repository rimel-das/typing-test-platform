import express from "express";
import cors from "cors";
import { createServer } from "http";
import dotenv from "dotenv";
import config from "./config";
import { errorHandler } from "./middleware/errorHandler";
import authRoutes from "./routes/auth";
import testRoutes from "./routes/tests";
import leaderboardRoutes from "./routes/leaderboard";
import { initializeWebSocket } from "./websocket/multiplayerHandler";

dotenv.config();

/**
 * Main Express Server
 * Typing Test Platform Backend
 */

const app = express();
const httpServer = createServer(app);

// Middleware
app.use(cors(config.cors));
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ limit: "10mb", extended: true }));

// Request logging middleware
app.use((req, _res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
  next();
});

// Health check
app.get("/health", (_req, res) => {
  res.status(200).json({ status: "ok" });
});

// API Routes
app.use("/api/auth", authRoutes);
app.use("/api/tests", testRoutes);
app.use("/api/leaderboard", leaderboardRoutes);

// 404 handler
app.use((_req, res) => {
  res.status(404).json({ error: "Not found" });
});

// Error handler
app.use(errorHandler);

// Initialize WebSocket
initializeWebSocket(httpServer);

// Start server
const PORT = config.port;
httpServer.listen(PORT, () => {
  console.log(`
╔════════════════════════════════════════════╗
║   Typing Test Platform - Backend Server    ║
║   Running on port ${PORT}                     ║
║   Environment: ${config.nodeEnv}                      ║
╚════════════════════════════════════════════╝
  `);
});

// Graceful shutdown
process.on("SIGTERM", () => {
  console.log("SIGTERM received, shutting down gracefully...");
  httpServer.close(() => {
    console.log("Server closed");
    process.exit(0);
  });
});

export default app;
