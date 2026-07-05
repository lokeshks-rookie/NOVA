// ─── Item Model ────────────────────────────────────────────────────────────
// Represents a lost or found item report. This is the central entity.

import mongoose from "mongoose";

const challengeQuestionSchema = new mongoose.Schema(
  {
    question: {
      type: String,
      required: true,
      trim: true,
    },
    answer: {
      type: String,
      required: true,
      trim: true,
    },
  },
  { _id: false }
);

const itemSchema = new mongoose.Schema(
  {
    type: {
      type: String,
      enum: ["lost", "found"],
      required: [true, "Item type (lost/found) is required"],
    },
    category: {
      type: String,
      required: [true, "Category is required"],
      enum: [
        "electronics",
        "id-cards",
        "bags",
        "clothing",
        "keys",
        "books",
        "jewellery",
        "other",
      ],
    },
    title: {
      type: String,
      required: [true, "Title is required"],
      trim: true,
      maxlength: 120,
    },
    description: {
      type: String,
      required: [true, "Description is required"],
      trim: true,
      minlength: [50, "Description must be at least 50 characters"],
    },
    location: {
      type: String,
      required: [true, "Location is required"],
      enum: [
        "Library",
        "Canteen",
        "Main Block",
        "Hostel Block A",
        "Hostel Block B",
        "Hostel Block C",
        "Sports Complex",
        "Parking",
        "Lab Block",
        "Other",
      ],
    },
    landmark: {
      type: String, // optional freeform detail like "near the stairs"
      trim: true,
    },
    date: {
      type: Date,
      required: [true, "Date of loss/find is required"],
    },
    imageUrls: {
      type: [String], // up to 4 photo URLs
      default: [],
    },

    // ── AI Moderation metadata ─────────────────────────────────────────
    aiModeration: {
      isFlagged: { type: Boolean, default: false },
      reason: { type: String, default: null },
      confidence: { type: Number, default: 0 },
    },

    status: {
      type: String,
      enum: ["open", "pending_claim", "claimed", "closed", "pending_verification"],
      default: "open",
    },
    referenceNumber: {
      type: String, // e.g. "CF-A1B2C3"
      unique: true,
    },

    // ── Hidden challenge questions (fraud prevention) ──────────────────
    challengeQuestions: {
      type: [challengeQuestionSchema],
      default: [],
    },

    // ── Reporter ─────────────────────────────────────────────────────
    reportedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

// ── Text index for search ──────────────────────────────────────────────────
// Weighted so description matches rank higher than title or category.
itemSchema.index(
  { title: "text", description: "text", category: "text" },
  { weights: { description: 3, title: 2, category: 1 } }
);

// ── Generate reference number before save ──────────────────────────────────
itemSchema.pre("save", function (next) {
  if (!this.referenceNumber) {
    const timestampPart = Date.now().toString(36).slice(-4).toUpperCase();
    const randomPart = Math.random().toString(36).slice(2, 4).toUpperCase();
    this.referenceNumber = `CF-${timestampPart}${randomPart}`;
  }
  next();
});

const Item = mongoose.model("Item", itemSchema);
export default Item;
