import { Router } from "express";
import {
  getMyAlerts,
  createAlert,
  toggleAlert,
  deleteAlert,
} from "../controllers/searchAlertController.js";

const router = Router();

// GET    /api/search-alerts            → user's saved searches
router.get("/", getMyAlerts);

// POST   /api/search-alerts            → create a new saved search
router.post("/", createAlert);

// PATCH  /api/search-alerts/:id/toggle → toggle active/paused
router.patch("/:id/toggle", toggleAlert);

// DELETE /api/search-alerts/:id        → delete a saved search
router.delete("/:id", deleteAlert);

export default router;
