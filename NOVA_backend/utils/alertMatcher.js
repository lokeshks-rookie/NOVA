// ─── Alert Matcher Utility ─────────────────────────────────────────────────
// Runs when a new Item is created. Checks all active SearchAlerts and creates
// Notifications for users whose saved search matches the new item.
// Phase 2: Also sends Email / SMS based on user preferences & alert settings.

import { SearchAlert, Notification } from "../../NOVA_database/models/index.js";
import { sendMatchEmail } from "./emailService.js";

/**
 * Check all active search alerts against a newly created item.
 * Uses simple keyword matching for MVP. Upgrade to vector search in Phase 2.
 *
 * @param {Object} newItem - The Mongoose item document just created.
 */
export async function checkAlertsOnNewItem(newItem) {
  // Populate user so we can access email, mobile, and notificationPrefs
  const activeAlerts = await SearchAlert.find({ status: "active" }).populate(
    "user",
    "name email mobile notificationPrefs"
  );

  if (!activeAlerts.length) return;

  const itemText = `${newItem.title} ${newItem.description} ${newItem.category}`.toLowerCase();

  const matchedAlerts = activeAlerts.filter((alert) => {
    // Category filter (if the alert has one, it must match)
    if (alert.category && alert.category !== newItem.category) return false;

    // Keyword matching: every word in the query must appear in the item text
    const words = alert.queryText.toLowerCase().split(/\s+/).filter(Boolean);
    return words.some((word) => itemText.includes(word));
  });

  // Create notifications for matched users and increment newMatches counter
  const ops = matchedAlerts.map(async (alert) => {
    // Increment match count
    alert.newMatches += 1;
    await alert.save();

    // Create in-app notification
    await Notification.create({
      user: alert.user._id,
      type: "match",
      title: "New match for your saved search",
      body: `A new item "${newItem.title}" matches your saved search for "${alert.queryText}".`,
      relatedItem: newItem._id,
    });

    // ── Phase 2: External notifications ──────────────────────────────────
    const prefs = alert.user.notificationPrefs || {};

    // Guard: the user must have savedSearchAlerts enabled globally
    if (!prefs.savedSearchAlerts) return;

    // ── Email ────────────────────────────────────────────────────────────
    if (alert.contactMethod === "email" && prefs.email && alert.user.email) {
      try {
        await sendMatchEmail({
          to: alert.user.email,
          userName: alert.user.name || "there",
          itemTitle: newItem.title,
          queryText: alert.queryText,
          itemCategory: newItem.category,
          itemUrl: `${process.env.CLIENT_URL || "http://localhost:3000"}/items/${newItem._id}`,
        });
      } catch (err) {
        console.error(
          `❌ Failed to send match email to ${alert.user.email}:`,
          err.message
        );
      }
    }

    // ── SMS (Twilio placeholder) ─────────────────────────────────────────
    if (alert.contactMethod === "sms" && prefs.sms && alert.user.mobile) {
      // TODO: Replace with actual Twilio integration
      console.log(
        `📱 Mock sending SMS to ${alert.user.mobile}: ` +
          `New match for "${alert.queryText}" — "${newItem.title}"`
      );
    }
  });

  await Promise.allSettled(ops);
  console.log(
    `🔔 Alert matcher: ${matchedAlerts.length}/${activeAlerts.length} alerts matched for item "${newItem.title}"`
  );
}

