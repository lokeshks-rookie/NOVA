// ─── Notification Controller ───────────────────────────────────────────────
// Fetch, mark-read for user's notifications.

import { Notification } from "../NOVA_database/models/index.js";

// @desc    Get current user's notifications
// @route   GET /api/notifications
export const getNotifications = async (req, res, next) => {
  try {
    const notifications = await Notification.find({ user: req.user._id })
      .sort({ createdAt: -1 })
      .limit(50);

    res.json({ success: true, data: notifications });
  } catch (error) {
    next(error);
  }
};

// @desc    Get unread count
// @route   GET /api/notifications/unread-count
export const getUnreadCount = async (req, res, next) => {
  try {
    const count = await Notification.countDocuments({
      user: req.user._id,
      read: false,
    });
    res.json({ success: true, data: { count } });
  } catch (error) {
    next(error);
  }
};

// @desc    Mark a single notification as read
// @route   PATCH /api/notifications/:id/read
export const markAsRead = async (req, res, next) => {
  try {
    const notification = await Notification.findOneAndUpdate(
      { _id: req.params.id, user: req.user._id },
      { read: true },
      { new: true }
    );

    if (!notification) {
      return res
        .status(404)
        .json({ success: false, message: "Notification not found" });
    }

    res.json({ success: true, data: notification });
  } catch (error) {
    next(error);
  }
};

// @desc    Mark all notifications as read
// @route   PATCH /api/notifications/read-all
export const markAllAsRead = async (req, res, next) => {
  try {
    await Notification.updateMany(
      { user: req.user._id, read: false },
      { read: true }
    );

    res.json({ success: true, message: "All notifications marked as read" });
  } catch (error) {
    next(error);
  }
};
