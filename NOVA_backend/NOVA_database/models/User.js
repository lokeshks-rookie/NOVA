import mongoose from "mongoose";
import bcrypt from "bcryptjs";

const userSchema = new mongoose.Schema(
  {
    // ─── Core identity ────────────────────────────────────────────
    name: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },

    // ─── Auth ─────────────────────────────────────────────────────
    password: {
      type: String,
      // Not required — Google-only users won't have a password
      select: false, // never return password in queries by default
    },
    googleId: {
      type: String,
      unique: true,
      sparse: true, // allows multiple null values (for non-Google users)
    },
    authProvider: {
      type: String,
      enum: ["local", "google"],
      default: "local",
    },

    // ─── Profile ──────────────────────────────────────────────────
    avatarUrl: {
      type: String,
      default: null,
    },
    role: {
      type: String,
      enum: ["student", "professor", "staff", "admin", "other"],
      default: "student",
    },
    mobile: {
      type: String,
      default: null,
    },
    department: {
      type: String,
      default: null,
    },
    year: {
      type: String,
      default: null,
    },
    idNumber: {
      type: String,
      default: null,
    },

    // ─── Metadata ─────────────────────────────────────────────────
    memberSince: {
      type: Date,
      default: Date.now,
    },
    isVerified: {
      type: Boolean,
      default: false,
    },

    // ── Notification preferences (From core-backend) ──────────────
    notificationPrefs: {
      email: { type: Boolean, default: true },
      sms: { type: Boolean, default: true },
      whatsapp: { type: Boolean, default: true },
      savedSearchAlerts: { type: Boolean, default: true },
    },
  },
  {
    timestamps: true,
  }
);

// ─── Pre-save hook: Hash password ──────────────────────────────────
userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// ─── Instance Method: Compare password ────────────────────────────
userSchema.methods.comparePassword = async function (candidatePassword) {
  if (!this.password) return false;
  return await bcrypt.compare(candidatePassword, this.password);
};

// ─── Virtual: id field (matches frontend's "id" instead of "_id") ──
userSchema.set("toJSON", {
  virtuals: true,
  versionKey: false,
  transform: (_doc, ret) => {
    ret.id = ret._id;
    delete ret._id;
    delete ret.password;
    return ret;
  },
});

const User = mongoose.model("User", userSchema);
export default User;
