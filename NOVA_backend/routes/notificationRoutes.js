import { Router } from "express";
import { verifyToken } from "../middleware/auth.js";
import {
  getNotifications,
  getUnreadCount,
  markAsRead,
  markAllAsRead,
} from "../controllers/notificationController.js";

const router = Router();

// GET   /api/notifications              → all user notifications
router.get("/", verifyToken, getNotifications);

// GET   /api/notifications/unread-count → badge count
router.get("/unread-count", verifyToken, getUnreadCount);

// PATCH /api/notifications/read-all    → mark all as read
router.patch("/read-all", verifyToken, markAllAsRead);

// PATCH /api/notifications/:id/read    → mark one as read
router.patch("/:id/read", verifyToken, markAsRead);

export default router;
