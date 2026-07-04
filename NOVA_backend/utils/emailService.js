// ─── Email Service ──────────────────────────────────────────────────────────
// Sends transactional emails using Nodemailer.
// Requires SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS in .env

import nodemailer from "nodemailer";

// ─── Transporter (created once, reused) ─────────────────────────────────────
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: Number(process.env.SMTP_PORT) || 587,
  secure: Number(process.env.SMTP_PORT) === 465, // true for 465, false for other ports
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

/**
 * Verify the SMTP connection on startup (non-blocking).
 * Logs success or failure — does NOT crash the server.
 */
if (
  process.env.SMTP_HOST && 
  process.env.SMTP_USER && 
  process.env.SMTP_USER !== "your-email@gmail.com"
) {
  transporter.verify().then(() => {
    console.log("📧 SMTP connection verified — email service ready");
  }).catch((err) => {
    console.warn("⚠️  SMTP connection failed (emails will not be sent):", err.message);
  });
} else {
  console.log("📧 SMTP email service is using placeholders or unconfigured (verification skipped)");
}

// ─── HTML Template ──────────────────────────────────────────────────────────

/**
 * Build a clean, inline-styled HTML email for a search-alert match.
 *
 * @param {Object} options
 * @param {string} options.userName    - Recipient's display name
 * @param {string} options.itemTitle   - Title of the newly matched item
 * @param {string} options.queryText   - The user's original saved search query
 * @param {string} options.itemCategory - Category of the matched item
 * @param {string} [options.itemUrl]   - Deep-link to the item (optional)
 * @returns {string} HTML string
 */
function buildMatchEmailHtml({ userName, itemTitle, queryText, itemCategory, itemUrl }) {
  const clientUrl = process.env.CLIENT_URL || "http://localhost:3000";
  const viewLink = itemUrl || `${clientUrl}/search`;

  return `
<!DOCTYPE html>
<html lang="en">
<head><meta charset="UTF-8" /></head>
<body style="margin:0;padding:0;background-color:#f4f6f8;font-family:'Segoe UI',Roboto,Helvetica,Arial,sans-serif;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color:#f4f6f8;padding:32px 0;">
    <tr>
      <td align="center">
        <table role="presentation" width="560" cellpadding="0" cellspacing="0" style="background-color:#ffffff;border-radius:12px;overflow:hidden;box-shadow:0 2px 8px rgba(0,0,0,0.08);">

          <!-- Header -->
          <tr>
            <td style="background:linear-gradient(135deg,#6366f1,#8b5cf6);padding:28px 32px;">
              <h1 style="margin:0;color:#ffffff;font-size:22px;font-weight:700;">🔔 CampusFind Alert</h1>
              <p style="margin:6px 0 0;color:#e0e7ff;font-size:14px;">A new item matches your saved search!</p>
            </td>
          </tr>

          <!-- Body -->
          <tr>
            <td style="padding:28px 32px;">
              <p style="margin:0 0 16px;font-size:15px;color:#374151;">
                Hi <strong>${userName}</strong>,
              </p>
              <p style="margin:0 0 20px;font-size:15px;color:#374151;line-height:1.6;">
                Great news! A newly posted item matches your saved search
                for <strong style="color:#6366f1;">"${queryText}"</strong>.
              </p>

              <!-- Item card -->
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color:#f9fafb;border:1px solid #e5e7eb;border-radius:8px;margin-bottom:24px;">
                <tr>
                  <td style="padding:16px 20px;">
                    <p style="margin:0 0 4px;font-size:13px;color:#6b7280;text-transform:uppercase;letter-spacing:0.05em;">Matched Item</p>
                    <p style="margin:0 0 8px;font-size:17px;font-weight:600;color:#111827;">${itemTitle}</p>
                    <p style="margin:0;font-size:13px;color:#6b7280;">Category: <span style="color:#374151;font-weight:500;">${itemCategory || "—"}</span></p>
                  </td>
                </tr>
              </table>

              <!-- CTA Button -->
              <table role="presentation" cellpadding="0" cellspacing="0" style="margin:0 auto;">
                <tr>
                  <td style="border-radius:8px;background:linear-gradient(135deg,#6366f1,#8b5cf6);">
                    <a href="${viewLink}" target="_blank" style="display:inline-block;padding:12px 32px;color:#ffffff;font-size:15px;font-weight:600;text-decoration:none;">
                      View Item →
                    </a>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="padding:20px 32px;border-top:1px solid #e5e7eb;">
              <p style="margin:0;font-size:12px;color:#9ca3af;text-align:center;">
                You received this because you saved a search alert on CampusFind.<br />
                <a href="${clientUrl}/settings" style="color:#6366f1;text-decoration:underline;">Manage notification preferences</a>
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}

// ─── Public API ─────────────────────────────────────────────────────────────

/**
 * Send a "new match" email notification to a user.
 *
 * @param {Object} options
 * @param {string} options.to          - Recipient email address
 * @param {string} options.userName    - Recipient's display name
 * @param {string} options.itemTitle   - Title of the newly matched item
 * @param {string} options.queryText   - The user's original saved search query
 * @param {string} options.itemCategory - Category of the matched item
 * @param {string} [options.itemUrl]   - Deep-link to the item (optional)
 */
export async function sendMatchEmail({ to, userName, itemTitle, queryText, itemCategory, itemUrl }) {
  const html = buildMatchEmailHtml({ userName, itemTitle, queryText, itemCategory, itemUrl });

  const info = await transporter.sendMail({
    from: `"CampusFind" <${process.env.SMTP_USER}>`,
    to,
    subject: `🔔 New match for "${queryText}" — CampusFind`,
    html,
  });

  console.log(`📧 Match email sent to ${to} (messageId: ${info.messageId})`);
  return info;
}
