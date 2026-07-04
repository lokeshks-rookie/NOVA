import { Router } from "express";
import { verifyToken } from "../middleware/auth.js";
import {
  getMyAlerts,
  createAlert,
  toggleAlert,
  deleteAlert,
} from "../controllers/searchAlertController.js";

const router = Router();

// GET    /api/search-alerts            → user's saved searches
router.get("/", verifyToken, getMyAlerts);

// POST   /api/search-alerts            → create a new saved search
router.post("/", verifyToken, createAlert);

// PATCH  /api/search-alerts/:id/toggle → toggle active/paused
router.patch("/:id/toggle", verifyToken, toggleAlert);

// DELETE /api/search-alerts/:id        → delete a saved search
router.delete("/:id", verifyToken, deleteAlert);

export default router;
