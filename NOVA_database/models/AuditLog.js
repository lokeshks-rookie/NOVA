// ─── AuditLog Model ────────────────────────────────────────────────────────
// Full audit trail for compliance and dispute resolution.
// Logs every claim approval/rejection, item status change, etc.

import mongoose from "mongoose";

const auditLogSchema = new mongoose.Schema(
  {
    action: {
      type: String,
      required: true,
      enum: [
        "item_created",
        "item_updated",
        "item_closed",
        "claim_submitted",
        "claim_approved",
        "claim_rejected",
        "user_registered",
        "user_updated",
        "alert_created",
        "alert_triggered",
      ],
    },
    actor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    target: {
      type: mongoose.Schema.Types.ObjectId, // could be Item, Claim, or User
      required: true,
    },
    targetModel: {
      type: String,
      enum: ["Item", "Claim", "User", "SearchAlert"],
      required: true,
    },
    metadata: {
      type: mongoose.Schema.Types.Mixed, // freeform JSON for extra context
      default: {},
    },
  },
  {
    timestamps: true,
  }
);

// Index for querying logs by actor or target
auditLogSchema.index({ actor: 1 });
auditLogSchema.index({ target: 1 });

const AuditLog = mongoose.model("AuditLog", auditLogSchema);
export default AuditLog;
