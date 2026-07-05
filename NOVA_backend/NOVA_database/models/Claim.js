// ─── Claim Model ───────────────────────────────────────────────────────────
// A user claims a found/lost item by answering challenge questions.
// Claims always go through admin review before pickup.

import mongoose from "mongoose";

const claimSchema = new mongoose.Schema(
  {
    item: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Item",
      required: true,
    },
    claimant: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    // Answers to the challenge questions set by the reporter
    answers: [
      {
        question: { type: String, required: true },
        answer: { type: String, required: true },
      },
    ],
    proofImageUrl: {
      type: String, // optional proof photo (receipt, old photo with item)
      default: null,
    },
    status: {
      type: String,
      enum: ["pending", "approved", "rejected"],
      default: "pending",
    },

    // ── Admin review ─────────────────────────────────────────────────
    reviewedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
    reviewedAt: {
      type: Date,
      default: null,
    },
    adminNote: {
      type: String, // reason for rejection, or pickup instructions
      default: null,
    },
    rejectReason: {
      type: String,
      enum: [
        "Answer does not match verification",
        "Insufficient proof of ownership",
        "Duplicate claim",
        "Fraudulent claim attempt",
        "Other",
        null,
      ],
      default: null,
    },

    // ── Pickup ───────────────────────────────────────────────────────
    pickupInfo: {
      type: String, // e.g. "Collect from Lost & Found desk. PIN: 4821"
      default: null,
    },
    pickupPin: {
      type: String, // 4-digit PIN for physical verification
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

// Ensure a user can only have one active claim per item
claimSchema.index({ item: 1, claimant: 1 }, { unique: true });

const Claim = mongoose.model("Claim", claimSchema);
export default Claim;
