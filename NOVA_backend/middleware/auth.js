// ════════════════════════════════════════════════════════════════════
//  Auth Middleware — NOVA
//  Verifies JWT from Authorization header or httpOnly cookie.
//  Attaches decoded user payload to req.user for downstream handlers.
// ════════════════════════════════════════════════════════════════════

import jwt from "jsonwebtoken";

/**
 * Middleware: verifyToken
 * Checks for a valid JWT in:
 *   1. Authorization: Bearer <token>  (API clients)
 *   2. cf_token cookie                (browser sessions)
 *
 * On success, sets req.user = { userId, email, role }
 * On failure, responds with 401.
 */
export function verifyToken(req, res, next) {
  let token = null;

  // 1. Check Authorization header
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith("Bearer ")) {
    token = authHeader.split(" ")[1];
  }

  // 2. Fallback to cookie
  if (!token && req.cookies?.cf_token) {
    token = req.cookies.cf_token;
  }

  if (!token) {
    return res.status(401).json({ message: "Authentication required." });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (err) {
    return res.status(401).json({ message: "Invalid or expired token." });
  }
}
