import { Router } from "express";
import {
  createItem,
  getItems,
  getItemById,
  updateItem,
  getItemStats,
} from "../controllers/itemController.js";

const router = Router();

// GET  /api/items/stats  → dashboard stats (must be before /:id)
router.get("/stats", getItemStats);

// GET  /api/items         → list/search all items
router.get("/", getItems);

// POST /api/items         → report a new item
router.post("/", createItem);

// GET  /api/items/:id     → single item detail
router.get("/:id", getItemById);

// PATCH /api/items/:id    → update item (owner or admin)
router.patch("/:id", updateItem);

export default router;
