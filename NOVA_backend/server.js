// ─── NOVA Backend — server.js ──────────────────────────────────────────────
// Entry point. Wires up Express, Mongoose, middleware, and all routes.

import "dotenv/config";
import express from "express";
import cors from "cors";
import connectDB from "../NOVA_database/connection.js";
import { mockAuth } from "./middleware/mockAuth.js";
import errorHandler from "./middleware/errorHandler.js";

// Route imports
import itemRoutes from "./routes/itemRoutes.js";
import claimRoutes from "./routes/claimRoutes.js";
import notificationRoutes from "./routes/notificationRoutes.js";
import searchAlertRoutes from "./routes/searchAlertRoutes.js";

const app = express();
const PORT = process.env.PORT || 5000;

// ─── Global Middleware ─────────────────────────────────────────────────────
app.use(cors({ origin: process.env.CLIENT_URL || "http://localhost:3000" }));
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true }));

// ─── Mock Auth (TEMPORARY — replace with real JWT middleware later) ─────
// This injects req.user for every request so we can test routes.
app.use("/api", mockAuth);

// ─── API Routes ────────────────────────────────────────────────────────────
// NOTE: Auth routes (/api/auth/*) are NOT here — your friend owns those.
// When they push, add:  import authRoutes from "./routes/authRoutes.js";
//                       app.use("/api/auth", authRoutes);

app.use("/api/items", itemRoutes);
app.use("/api/claims", claimRoutes);
app.use("/api/notifications", notificationRoutes);
app.use("/api/search-alerts", searchAlertRoutes);

// ─── Health Check ──────────────────────────────────────────────────────────
app.get("/api/health", (_req, res) => {
  res.json({ status: "ok", uptime: process.uptime() });
});

// ─── Error Handler (must be last) ──────────────────────────────────────────
app.use(errorHandler);

// ─── Start Server ──────────────────────────────────────────────────────────
const start = async () => {
  await connectDB();
  app.listen(PORT, () => {
    console.log(`\n🚀 NOVA Backend running on http://localhost:${PORT}`);
    console.log(`📡 API base: http://localhost:${PORT}/api`);
    console.log(`🩺 Health:   http://localhost:${PORT}/api/health\n`);
  });
};

start();
