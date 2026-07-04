// ════════════════════════════════════════════════════════════════════
//  server.js — NOVA Backend Entry Point
//  Tech stack : Node.js + Express + MongoDB (Mongoose)
// ════════════════════════════════════════════════════════════════════

import "dotenv/config";
import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import cookieParser from "cookie-parser";
import authRoutes from "./routes/auth.js";

const app = express();
const PORT = process.env.PORT || 5000;

// ─── Middleware ──────────────────────────────────────────────────────
app.use(express.json());
app.use(cookieParser());
app.use(
  cors({
    origin: process.env.CLIENT_URL || "http://localhost:3000",
    credentials: true, // allow cookies to be sent cross-origin
  })
);

// ─── Routes ─────────────────────────────────────────────────────────
app.use("/api/auth", authRoutes);

// Health check
app.get("/api/health", (_req, res) => {
  res.json({ status: "ok", timestamp: new Date().toISOString() });
});

// ─── MongoDB connection (optional — server starts without it) ───────
const MONGODB_URI = process.env.MONGODB_URI;

async function startServer() {
  if (MONGODB_URI) {
    try {
      await mongoose.connect(MONGODB_URI);
      console.log("✅  Connected to MongoDB");
    } catch (err) {
      console.warn("⚠️  MongoDB connection failed:", err.message);
      console.warn("   Server will start, but user creation/login won't work until MongoDB is connected.");
    }
  } else {
    console.warn("⚠️  MONGODB_URI not set — running without database.");
    console.warn("   Google OAuth redirect will work, but callback will fail until MongoDB is configured.");
  }

  app.listen(PORT, () => {
    console.log(`🚀  NOVA backend running on http://localhost:${PORT}`);
  });
}

startServer();
