// ─── Alert Matcher Utility ─────────────────────────────────────────────────
// Runs when a new Item is created. Checks all active SearchAlerts and creates
// Notifications for users whose saved search matches the new item.

import { SearchAlert, Notification } from "../../NOVA_database/models/index.js";

/**
 * Check all active search alerts against a newly created item.
 * Uses simple keyword matching for MVP. Upgrade to vector search in Phase 2.
 *
 * @param {Object} newItem - The Mongoose item document just created.
 */
export async function checkAlertsOnNewItem(newItem) {
  const activeAlerts = await SearchAlert.find({ status: "active" });

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
      user: alert.user,
      type: "match",
      title: "New match for your saved search",
      body: `A new item "${newItem.title}" matches your saved search for "${alert.queryText}".`,
      relatedItem: newItem._id,
    });

    // TODO (Phase 2): Send email/SMS based on alert.contactMethod
    // if (alert.contactMethod === "sms") { ... }
    // if (alert.contactMethod === "email") { ... }
  });

  await Promise.allSettled(ops);
  console.log(
    `🔔 Alert matcher: ${matchedAlerts.length}/${activeAlerts.length} alerts matched for item "${newItem.title}"`
  );
}
