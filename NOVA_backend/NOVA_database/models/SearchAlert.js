// ─── SearchAlert Model ─────────────────────────────────────────────────────
// When a user searches and gets no results (or explicitly saves a search),
// we store the query. Every time a new Item is created, we check active
// alerts and notify matching users.

import mongoose from "mongoose";

const searchAlertSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    queryText: {
      type: String,
      required: [true, "Search query text is required"],
      trim: true,
    },
    category: {
      type: String, // optional category filter
      enum: [
        "electronics",
        "id-cards",
        "bags",
        "clothing",
        "keys",
        "books",
        "jewellery",
        "other",
        null,
      ],
      default: null,
    },
    status: {
      type: String,
      enum: ["active", "paused", "fulfilled"],
      default: "active",
    },
    // How many new items have matched since last seen
    newMatches: {
      type: Number,
      default: 0,
    },
    contactMethod: {
      type: String,
      enum: ["email", "sms", "push"],
      default: "email",
    },
  },
  {
    timestamps: true,
  }
);

// Index for efficient matching when new items arrive
searchAlertSchema.index({ status: 1 });

const SearchAlert = mongoose.model("SearchAlert", searchAlertSchema);
export default SearchAlert;
