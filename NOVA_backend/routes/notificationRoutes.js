import { Router } from "express";
import {
  getNotifications,
  getUnreadCount,
  markAsRead,
  markAllAsRead,
} from "../controllers/notificationController.js";

const router = Router();

// GET   /api/notifications              → all user notifications
router.get("/", getNotifications);

// GET   /api/notifications/unread-count → badge count
router.get("/unread-count", getUnreadCount);

// PATCH /api/notifications/read-all    → mark all as read
router.patch("/read-all", markAllAsRead);

// PATCH /api/notifications/:id/read    → mark one as read
router.patch("/:id/read", markAsRead);

export default router;
