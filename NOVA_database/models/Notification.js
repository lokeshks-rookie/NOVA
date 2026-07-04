// ─── Notification Model ────────────────────────────────────────────────────
// Stores in-app notifications. Matches the frontend's mockNotifications shape
// with types: "match", "claim", "system".

import mongoose from "mongoose";

const notificationSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    type: {
      type: String,
      enum: ["match", "claim", "system"],
      required: true,
    },
    title: {
      type: String,
      required: true,
      trim: true,
    },
    body: {
      type: String,
      required: true,
      trim: true,
    },
    read: {
      type: Boolean,
      default: false,
    },
    // Optional link to related resource
    relatedItem: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Item",
      default: null,
    },
    relatedClaim: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Claim",
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

// Index to quickly fetch a user's unread notifications
notificationSchema.index({ user: 1, read: 1 });

const Notification = mongoose.model("Notification", notificationSchema);
export default Notification;
