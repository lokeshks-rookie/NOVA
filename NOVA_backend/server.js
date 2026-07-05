// ─── NOVA Backend — server.js ──────────────────────────────────────────────
// Entry point. Wires up Express, Mongoose, middleware, and all routes.

import "dotenv/config";
import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import connectDB from "./NOVA_database/connection.js";
import errorHandler from "./middleware/errorHandler.js";

// Route imports
import authRoutes from "./routes/auth.js";
import itemRoutes from "./routes/itemRoutes.js";
import claimRoutes from "./routes/claimRoutes.js";
import notificationRoutes from "./routes/notificationRoutes.js";
import searchAlertRoutes from "./routes/searchAlertRoutes.js";
import aiRoutes from "./routes/aiRoutes.js";
import uploadRoutes from "./routes/uploadRoutes.js";

const app = express();
app.set('trust proxy', 1);
const PORT = process.env.PORT || 5000;

app.use(
  cors({
    origin: [
      process.env.CLIENT_URL || 'http://localhost:3000', // keep for local dev
      'https://nova-lost-and-found.vercel.app',        // replace with your actual Vercel URL later
    ],
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true, // allow cookies to be sent cross-origin (required for auth)
  })
);
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// ─── API Routes ────────────────────────────────────────────────────────────
app.use("/api/auth", authRoutes);
app.use("/api/items", itemRoutes);
app.use("/api/claims", claimRoutes);
app.use("/api/notifications", notificationRoutes);
app.use("/api/search-alerts", searchAlertRoutes);
app.use("/api/uploads", uploadRoutes);
app.use("/api/ai", aiRoutes);

// ─── Health Check ──────────────────────────────────────────────────────────
app.get("/api/health", (_req, res) => {
  res.json({ status: "ok", uptime: process.uptime(), timestamp: new Date().toISOString() });
});

// ─── Error Handler (must be last) ──────────────────────────────────────────
app.use(errorHandler);

// ─── Start Server ──────────────────────────────────────────────────────────
const start = async () => {
  await connectDB();
  const server = app.listen(PORT, () => {
    console.log(`\n🚀 NOVA Backend running on http://localhost:${PORT}`);
    console.log(`📡 API base: http://localhost:${PORT}/api`);
    console.log(`🩺 Health:   http://localhost:${PORT}/api/health\n`);
  });

  // Handle unhandled promise rejections inside startup/server
  process.on("unhandledRejection", (err) => {
    console.error("❌ UNHANDLED REJECTION! Shutting down...");
    console.error(err);
    server.close(() => {
      process.exit(1);
    });
  });
};

process.on("uncaughtException", (err) => {
  console.error("❌ UNCAUGHT EXCEPTION! Shutting down...");
  console.error(err.name, err.message, err.stack);
  process.exit(1);
});

start();
