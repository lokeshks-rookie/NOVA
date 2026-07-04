// ─── Item Controller ───────────────────────────────────────────────────────
// Handles CRUD + text search for lost/found items.

import { Item, AuditLog } from "../../NOVA_database/models/index.js";
import { checkAlertsOnNewItem } from "../utils/alertMatcher.js";
import { validateReportIntegrity, filterSearchItems } from "../utils/gemini.js";

// @desc    Report a new lost/found item
// @route   POST /api/items
export const createItem = async (req, res, next) => {
  try {
    const {
      type,
      category,
      title,
      description,
      location,
      landmark,
      date,
      imageUrls,
      challengeQuestions,
    } = req.body;

    // Call Gemini AI integrity validation
    const aiCheck = await validateReportIntegrity(
      title,
      description,
      category,
      type,
      imageUrls || []
    );

    const item = await Item.create({
      type,
      category,
      title,
      description,
      location,
      landmark: landmark || null,
      date: date || new Date(),
      imageUrls: imageUrls || [],
      challengeQuestions: challengeQuestions || [],
      reportedBy: req.user._id,
      status: aiCheck.isFlagged ? "pending_verification" : "open",
      aiModeration: {
        isFlagged: aiCheck.isFlagged,
        reason: aiCheck.reason,
        confidence: aiCheck.confidence || 0,
      },
    });

    // Audit log
    await AuditLog.create({
      action: "item_reported",
      actor: req.user._id,
      target: item._id,
      targetModel: "Item",
      metadata: { type, category, location, aiFlagged: aiCheck.isFlagged },
    });

    // Fire-and-forget: check saved search alerts (only if not flagged by AI)
    if (!aiCheck.isFlagged) {
      checkAlertsOnNewItem(item).catch((err) =>
        console.error("Alert check failed:", err.message)
      );
    }

    res.status(201).json({ success: true, data: item });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all items (with filters + text search)
// @route   GET /api/items
export const getItems = async (req, res, next) => {
  try {
    const { q, type, category, location, status, dateFrom, dateTo, page = 1, limit = 20 } = req.query;

    const filter = {};

    // Text search
    if (q) {
      filter.$text = { $search: q };
    }

    // Filters
    if (type && type !== "all") filter.type = type;
    if (category) filter.category = category;
    if (location) filter.location = location;
    if (status) filter.status = status;

    // Date range
    if (dateFrom || dateTo) {
      filter.date = {};
      if (dateFrom) filter.date.$gte = new Date(dateFrom);
      if (dateTo) filter.date.$lte = new Date(dateTo);
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);

    // If text search is active, sort by relevance; otherwise by newest
    const sortOption = q
      ? { score: { $meta: "textScore" }, createdAt: -1 }
      : { createdAt: -1 };

    const selectOption = q
      ? { score: { $meta: "textScore" } }
      : {};

    const [items, total] = await Promise.all([
      Item.find(filter, selectOption)
        .sort(sortOption)
        .skip(skip)
        .limit(parseInt(limit))
        .populate("reportedBy", "name email role"),
      Item.countDocuments(filter),
    ]);

    res.json({
      success: true,
      data: items,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / parseInt(limit)),
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single item by ID
// @route   GET /api/items/:id
export const getItemById = async (req, res, next) => {
  try {
    const item = await Item.findById(req.params.id).populate(
      "reportedBy",
      "name email role"
    );

    if (!item) {
      return res
        .status(404)
        .json({ success: false, message: "Item not found" });
    }

    res.json({ success: true, data: item });
  } catch (error) {
    next(error);
  }
};

// @desc    Update an item (status, details)
// @route   PATCH /api/items/:id
export const updateItem = async (req, res, next) => {
  try {
    const item = await Item.findById(req.params.id);

    if (!item) {
      return res
        .status(404)
        .json({ success: false, message: "Item not found" });
    }

    // Only the reporter or an admin can update
    const isOwner = item.reportedBy.toString() === req.user._id.toString();
    const isAdmin = ["admin", "staff"].includes(req.user.role);
    if (!isOwner && !isAdmin) {
      return res
        .status(403)
        .json({ success: false, message: "Not authorised to update this item" });
    }

    const updatedItem = await Item.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    await AuditLog.create({
      action: "item_updated",
      actor: req.user._id,
      target: item._id,
      targetModel: "Item",
      metadata: req.body,
    });

    res.json({ success: true, data: updatedItem });
  } catch (error) {
    next(error);
  }
};

// @desc    Get dashboard stats
// @route   GET /api/items/stats
export const getItemStats = async (_req, res, next) => {
  try {
    const oneWeekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);

    const [total, open, pending, thisWeek] = await Promise.all([
      Item.countDocuments(),
      Item.countDocuments({ status: "open" }),
      Item.countDocuments({ status: "pending_claim" }),
      Item.countDocuments({ createdAt: { $gte: oneWeekAgo } }),
    ]);

    res.json({
      success: true,
      data: { total, open, pending, thisWeek },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete an item (owner or admin only)
// @route   DELETE /api/items/:id
export const deleteItem = async (req, res, next) => {
  try {
    const item = await Item.findById(req.params.id);

    if (!item) {
      return res
        .status(404)
        .json({ success: false, message: "Item not found" });
    }

    // Only the reporter or an admin can delete
    const isOwner = item.reportedBy.toString() === req.user._id.toString();
    const isAdmin = ["admin", "staff"].includes(req.user.role);
    if (!isOwner && !isAdmin) {
      return res
        .status(403)
        .json({ success: false, message: "Not authorised to delete this item" });
    }

    await Item.findByIdAndDelete(req.params.id);

    await AuditLog.create({
      action: "item_deleted",
      actor: req.user._id,
      target: item._id,
      targetModel: "Item",
      metadata: { title: item.title, category: item.category },
    });

    res.json({ success: true, message: "Item deleted" });
  } catch (error) {
    next(error);
  }
};

// @desc    Semantic AI Search
// @route   GET /api/items/ai-search
export const aiSearchItems = async (req, res, next) => {
  try {
    const { q } = req.query;
    if (!q || !q.trim()) {
      return res.status(400).json({ success: false, message: "Query parameter 'q' is required." });
    }

    // Fetch all open items
    const dbItems = await Item.find({ status: "open" }).populate("reportedBy", "name email role");

    // Perform semantic filtering and ranking via Gemini
    const matches = await filterSearchItems(q, dbItems);

    if (!matches || matches.length === 0) {
      return res.json({ success: true, data: [] });
    }

    const matchedItemIds = matches.map((m) => m.id);
    const scoreMap = new Map(matches.map((m) => [m.id, m.score]));

    // Construct matched items list with relevance score
    const filteredItems = dbItems
      .filter((item) => matchedItemIds.includes(item._id.toString()))
      .map((item) => {
        const itemObj = item.toObject();
        itemObj.relevanceScore = scoreMap.get(item._id.toString());
        return itemObj;
      })
      .sort((a, b) => b.relevanceScore - a.relevanceScore);

    res.json({ success: true, data: filteredItems });
  } catch (error) {
    next(error);
  }
};
