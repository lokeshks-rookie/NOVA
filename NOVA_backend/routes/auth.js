// ════════════════════════════════════════════════════════════════════
//  Auth Routes — NOVA
//  Handles Google OAuth 2.0 login with CSRF state validation
//  and server-side ID token verification.
//
//  Routes:
//    GET  /api/auth/google          → Redirect to Google consent screen
//    GET  /api/auth/google/callback → Handle OAuth callback
// ════════════════════════════════════════════════════════════════════

import { Router } from "express";
import crypto from "crypto";
import jwt from "jsonwebtoken";
import { OAuth2Client } from "google-auth-library";
import User from "../../NOVA_database/models/User.js";

const router = Router();

// ─── Config validation ──────────────────────────────────────────────
const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID;
const GOOGLE_CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET;
const GOOGLE_CALLBACK_URL = process.env.GOOGLE_CALLBACK_URL;
const CLIENT_URL = process.env.CLIENT_URL || "http://localhost:3000";
const JWT_SECRET = process.env.JWT_SECRET;

if (!GOOGLE_CLIENT_ID || !GOOGLE_CLIENT_SECRET || !GOOGLE_CALLBACK_URL || !JWT_SECRET) {
  console.error(
    "❌  Missing required env vars: GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET, GOOGLE_CALLBACK_URL, JWT_SECRET"
  );
}

const oAuth2Client = new OAuth2Client(
  GOOGLE_CLIENT_ID,
  GOOGLE_CLIENT_SECRET,
  GOOGLE_CALLBACK_URL
);

// ─── Helpers ────────────────────────────────────────────────────────

/** Sign a JWT for the app session */
function signToken(user) {
  return jwt.sign(
    { userId: user._id, email: user.email, role: user.role },
    JWT_SECRET,
    { expiresIn: "7d" }
  );
}

/** Build a safe user object for the frontend (matches mock.js shape) */
function buildUserPayload(user) {
  return {
    id: user._id,
    name: user.name,
    email: user.email,
    role: user.role,
    mobile: user.mobile || null,
    department: user.department || null,
    year: user.year || null,
    idNumber: user.idNumber || null,
    memberSince: user.memberSince,
    avatar: user.avatarUrl || null,
  };
}

/** Determine if we're running in production */
function isProduction() {
  return process.env.NODE_ENV === "production";
}

// ════════════════════════════════════════════════════════════════════
//  GET /api/auth/google
//  Generates a CSRF state nonce, stores it in a httpOnly cookie,
//  and redirects the user to Google's OAuth 2.0 consent screen.
// ════════════════════════════════════════════════════════════════════
router.get("/google", (_req, res) => {
  try {
    // Generate a random state nonce for CSRF protection
    const state = crypto.randomBytes(32).toString("hex");

    // Store state in a short-lived httpOnly cookie (5 min expiry)
    res.cookie("oauth_state", state, {
      httpOnly: true,
      secure: isProduction(),
      sameSite: "lax",
      maxAge: 5 * 60 * 1000, // 5 minutes
      path: "/",
    });

    // Build the Google OAuth consent URL
    const authUrl = oAuth2Client.generateAuthUrl({
      access_type: "offline",
      scope: ["profile", "email"],
      state,
      prompt: "consent",
    });

    res.redirect(authUrl);
  } catch (err) {
    console.error("❌  Error initiating Google OAuth:", err.message);
    res.redirect(`${CLIENT_URL}/login?error=google_auth_failed`);
  }
});

// ════════════════════════════════════════════════════════════════════
//  GET /api/auth/google/callback
//  Handles the redirect from Google after the user grants (or denies)
//  consent. Validates state, exchanges code for tokens, verifies the
//  ID token, finds/creates the user, and redirects to the frontend.
// ════════════════════════════════════════════════════════════════════
router.get("/google/callback", async (req, res) => {
  const { code, state, error: oauthError } = req.query;

  // ── 1. Handle user denial or Google errors ────────────────────
  if (oauthError) {
    console.warn("⚠️  Google OAuth error:", oauthError);
    return res.redirect(`${CLIENT_URL}/login?error=google_auth_failed`);
  }

  // ── 2. Validate the authorization code is present ─────────────
  if (!code) {
    console.warn("⚠️  No authorization code received from Google");
    return res.redirect(`${CLIENT_URL}/login?error=google_auth_failed`);
  }

  // ── 3. CSRF: Validate state parameter against the cookie ──────
  const storedState = req.cookies?.oauth_state;
  if (!state || !storedState || state !== storedState) {
    console.warn("⚠️  OAuth state mismatch — possible CSRF attack");
    // Clear the stale cookie
    res.clearCookie("oauth_state", { path: "/" });
    return res.redirect(`${CLIENT_URL}/login?error=google_auth_failed`);
  }

  // Clear the state cookie — it's single-use
  res.clearCookie("oauth_state", { path: "/" });

  try {
    // ── 4. Exchange the authorization code for tokens ────────────
    const { tokens } = await oAuth2Client.getToken(code);
    oAuth2Client.setCredentials(tokens);

    // ── 5. Verify the ID token and extract claims ───────────────
    //    This is the critical security step — never trust claims
    //    from the frontend or from unverified tokens.
    const ticket = await oAuth2Client.verifyIdToken({
      idToken: tokens.id_token,
      audience: GOOGLE_CLIENT_ID,
    });

    const payload = ticket.getPayload();
    const { sub: googleId, email, name, picture } = payload;

    if (!email) {
      console.warn("⚠️  No email in Google ID token");
      return res.redirect(`${CLIENT_URL}/login?error=google_auth_failed`);
    }

    // ── 6. User matching / creation logic ───────────────────────
    //    Priority: match by googleId first, then by email
    let user = await User.findOne({ googleId });

    if (!user) {
      // Try to find an existing user by email (e.g. they signed up
      // with email/password first, and now are linking Google)
      user = await User.findOne({ email: email.toLowerCase() });

      if (user) {
        // Link the Google account to the existing user
        user.googleId = googleId;
        user.avatarUrl = user.avatarUrl || picture;
        // Don't overwrite authProvider if they already have 'local'
        // — they now have both methods available
        await user.save();
      } else {
        // New user — create account
        user = await User.create({
          name,
          email: email.toLowerCase(),
          googleId,
          authProvider: "google",
          avatarUrl: picture,
          role: "student", // default role; can be changed in profile
          isVerified: true, // Google-verified email
          memberSince: new Date(),
        });
      }
    } else {
      // User found by googleId — update profile picture if changed
      if (picture && user.avatarUrl !== picture) {
        user.avatarUrl = picture;
        await user.save();
      }
    }

    // ── 7. Issue our app JWT ────────────────────────────────────
    const token = signToken(user);
    const userPayload = buildUserPayload(user);

    // Set JWT as httpOnly cookie (for API calls from the browser)
    res.cookie("cf_token", token, {
      httpOnly: true,
      secure: isProduction(),
      sameSite: "lax",
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
      path: "/",
    });

    // ── 8. Redirect to frontend callback page ───────────────────
    //    We pass token + user in the URL so the React SPA can
    //    store them in localStorage (matching existing auth pattern).
    //    The token is short-lived in the URL — it's immediately
    //    consumed by OAuthCallbackPage and removed from the URL bar.
    const encodedUser = encodeURIComponent(JSON.stringify(userPayload));
    const redirectUrl = `${CLIENT_URL}/auth/callback?token=${token}&user=${encodedUser}`;

    res.redirect(redirectUrl);
  } catch (err) {
    console.error("❌  Google OAuth callback error:", err.message);

    // Differentiate between Google API errors and database errors
    if (err.message?.includes("invalid_grant")) {
      console.error("   → Authorization code expired or already used");
    } else if (err.message?.includes("Token used too late")) {
      console.error("   → ID token expired");
    }

    res.redirect(`${CLIENT_URL}/login?error=google_auth_failed`);
  }
});

export default router;
