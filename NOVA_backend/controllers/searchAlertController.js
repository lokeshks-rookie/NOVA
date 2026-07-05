// ─── SearchAlert Controller ────────────────────────────────────────────────
// Saved searches — CRUD + toggle for current user.

import { SearchAlert, AuditLog } from "../NOVA_database/models/index.js";

// @desc    Get current user's saved searches
// @route   GET /api/search-alerts
export const getMyAlerts = async (req, res, next) => {
  try {
    const alerts = await SearchAlert.find({ user: req.user._id }).sort({
      createdAt: -1,
    });
    res.json({ success: true, data: alerts });
  } catch (error) {
    next(error);
  }
};

// @desc    Create a new saved search alert
// @route   POST /api/search-alerts
export const createAlert = async (req, res, next) => {
  try {
    const { queryText, query, category, contactMethod } = req.body;
    // Accept both field names for frontend compatibility
    const searchText = queryText || query;

    const alert = await SearchAlert.create({
      user: req.user._id,
      queryText: searchText,
      category: category || null,
      contactMethod: contactMethod || "email",
    });

    await AuditLog.create({
      action: "alert_created",
      actor: req.user._id,
      target: alert._id,
      targetModel: "SearchAlert",
      metadata: { queryText: searchText, category },
    });

    res.status(201).json({ success: true, data: alert });
  } catch (error) {
    next(error);
  }
};

// @desc    Toggle a saved search (active ↔ paused)
// @route   PATCH /api/search-alerts/:id/toggle
export const toggleAlert = async (req, res, next) => {
  try {
    const alert = await SearchAlert.findOne({
      _id: req.params.id,
      user: req.user._id,
    });

    if (!alert) {
      return res
        .status(404)
        .json({ success: false, message: "Search alert not found" });
    }

    alert.status = alert.status === "active" ? "paused" : "active";
    await alert.save();

    res.json({ success: true, data: alert });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete a saved search
// @route   DELETE /api/search-alerts/:id
export const deleteAlert = async (req, res, next) => {
  try {
    const alert = await SearchAlert.findOneAndDelete({
      _id: req.params.id,
      user: req.user._id,
    });

    if (!alert) {
      return res
        .status(404)
        .json({ success: false, message: "Search alert not found" });
    }

    res.json({ success: true, message: "Search alert deleted" });
  } catch (error) {
    next(error);
  }
};
