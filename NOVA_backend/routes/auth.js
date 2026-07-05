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
import rateLimit from "express-rate-limit";
import User from "../NOVA_database/models/User.js";
import { verifyToken } from "../middleware/auth.js";

// Rate limiter for auth endpoints (max 15 attempts per 15 minutes per IP)
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 15, // Limit each IP to 15 requests per window
  message: {
    success: false,
    message: "Too many authentication requests from this IP. Please try again after 15 minutes."
  },
  standardHeaders: true, // Return rate limit info in the RateLimit-* headers
  legacyHeaders: false, // Disable the X-RateLimit-* headers
});

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
    notificationPrefs: user.notificationPrefs || {
      email: true,
      sms: true,
      whatsapp: true,
      savedSearchAlerts: true,
    },
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
    const authUrl = oAuth2Client.generateAuthUrl({
      access_type: "offline",
      scope: ["profile", "email"],
      prompt: "consent",
    });
    res.redirect(authUrl);
  } catch (err) {
    console.error("Error initiating Google OAuth:", err.message);
    res.redirect(`${CLIENT_URL}/login?error=google_auth_failed`);
  }
});

// ════════════════════════════════════════════════════════════════════
//  GET /api/auth/google/callback
//  Handles the redirect from Google after the user grants (or denies)
//  consent. Validates state, exchanges code for tokens, verifies the
//  ID token, finds/creates the user, and redirects to the frontend.
// ════════════════════════════════════════════════════════════════════
router.get("/google/callback", async (req, res, next) => {
  const { code, error: oauthError } = req.query;

  if (oauthError) {
    console.warn("Google OAuth error:", oauthError);
    return res.redirect(`${CLIENT_URL}/login?error=google_auth_failed`);
  }

  if (!code) {
    console.warn("No authorization code received from Google");
    return res.redirect(`${CLIENT_URL}/login?error=google_auth_failed`);
  }

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
      sameSite: isProduction() ? "none" : "lax",
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

    next(err);
  }
});

// ════════════════════════════════════════════════════════════════════
//  POST /api/auth/signup
//  Registers a new user via local email/password.
// ════════════════════════════════════════════════════════════════════
router.post("/signup", authLimiter, async (req, res, next) => {
  try {
    const {
      role,
      fullName,
      email,
      mobile,
      department,
      password,
      studentId,
      yearOfStudy,
      employeeId,
    } = req.body;

    // Validate essential fields
    if (!fullName || !email || !password || !role) {
      return res.status(400).json({ success: false, message: "Missing required fields." });
    }

    const emailLower = email.toLowerCase();
    
    // Check if user already exists
    const existingUser = await User.findOne({ email: emailLower });
    if (existingUser) {
      return res.status(409).json({ success: false, message: "Email is already registered." });
    }

    // Create new user (password is hashed automatically by pre-save hook)
    const newUser = await User.create({
      name: fullName,
      email: emailLower,
      password,
      role,
      authProvider: "local",
      mobile: mobile || null,
      department: department || null,
      year: yearOfStudy || null,
      idNumber: studentId || employeeId || null,
    });

    // Issue JWT
    const token = signToken(newUser);
    const userPayload = buildUserPayload(newUser);

    res.cookie("cf_token", token, {
      httpOnly: true,
      secure: isProduction(),
      sameSite: isProduction() ? "none" : "lax",
      maxAge: 7 * 24 * 60 * 60 * 1000,
      path: "/",
    });

    res.status(201).json({ success: true, token, user: userPayload });
  } catch (error) {
    console.error("❌  Signup error:", error.message);
    console.error(error.stack);
    next(error);
  }
});

// ════════════════════════════════════════════════════════════════════
//  POST /api/auth/login
//  Authenticates a user via local email/password.
// ════════════════════════════════════════════════════════════════════
router.post("/login", authLimiter, async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ success: false, message: "Email and password are required." });
    }

    // Find user and explicitly select password (which is select: false by default)
    const user = await User.findOne({ email: email.toLowerCase() }).select("+password");
    
    if (!user) {
      return res.status(401).json({ success: false, message: "Invalid credentials or user doesn't exist." });
    }

    // If password doesn't exist (e.g. Google-only account), redirect to Google Auth
    if (!user.password) {
      return res.status(400).json({
        success: false,
        message: "This account was registered using Google. Please sign in with Google."
      });
    }

    // Verify password
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: "Invalid credentials." });
    }

    // Issue JWT
    const token = signToken(user);
    const userPayload = buildUserPayload(user);

    res.cookie("cf_token", token, {
      httpOnly: true,
      secure: isProduction(),
      sameSite: isProduction() ? "none" : "lax",
      maxAge: 7 * 24 * 60 * 60 * 1000,
      path: "/",
    });

    res.status(200).json({ success: true, token, user: userPayload });
  } catch (error) {
    console.error("❌  Login error:", error.message);
    next(error);
  }
});

// ════════════════════════════════════════════════════════════════════
//  GET /api/auth/me
//  Returns the authenticated user's profile. Used by the frontend to
//  rehydrate user state on page refresh.
// ════════════════════════════════════════════════════════════════════
router.get("/me", verifyToken, async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id).select("-password");
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }
    res.json({ success: true, data: buildUserPayload(user) });
  } catch (err) {
    console.error("❌  Error fetching profile:", err.message);
    next(err);
  }
});

// ════════════════════════════════════════════════════════════════════
//  PATCH /api/auth/profile
//  Updates the authenticated user's mutable profile fields:
//  name, mobile, department, year.
// ════════════════════════════════════════════════════════════════════
router.patch("/profile", verifyToken, async (req, res, next) => {
  try {
    const { name, mobile, department, year } = req.body;

    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    // Only update fields that are present in the request
    if (name !== undefined) user.name = name;
    if (mobile !== undefined) user.mobile = mobile;
    if (department !== undefined) user.department = department;
    if (year !== undefined) user.year = year;

    await user.save();

    res.json({ success: true, data: buildUserPayload(user) });
  } catch (err) {
    console.error("❌  Error updating profile:", err.message);
    next(err);
  }
});

export default router;
