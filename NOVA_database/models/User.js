// ─── User Model ────────────────────────────────────────────────────────────
// NOTE: Your friend owns the Auth flow. This schema is here so other models
// can reference it via ObjectId. Do NOT add auth routes yourself.

import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Name is required"],
      trim: true,
    },
    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true,
      lowercase: true,
      trim: true,
      match: [/^[\w.-]+@[\w.-]+\.\w{2,}$/, "Please provide a valid email"],
    },
    password: {
      type: String,
      required: [true, "Password is required"],
      minlength: 6,
      select: false, // never returned in queries by default
    },
    role: {
      type: String,
      enum: ["student", "staff", "admin", "professor"],
      default: "student",
    },
    mobile: {
      type: String,
      trim: true,
    },
    department: {
      type: String,
      trim: true,
    },
    year: {
      type: String, // e.g. "2nd Year"
      default: null,
    },
    idNumber: {
      type: String, // campus ID like "CSE21042"
      trim: true,
    },
    avatar: {
      type: String, // URL to profile photo
      default: null,
    },
    isVerified: {
      type: Boolean,
      default: false,
    },

    // ── Notification preferences ──────────────────────────────────────
    notificationPrefs: {
      email: { type: Boolean, default: true },
      sms: { type: Boolean, default: true },
      whatsapp: { type: Boolean, default: true },
      savedSearchAlerts: { type: Boolean, default: true },
    },
  },
  {
    timestamps: true, // createdAt, updatedAt
  }
);

const User = mongoose.model("User", userSchema);
export default User;
