// ─── Mock Auth Middleware ───────────────────────────────────────────────────
// TEMPORARY: Injects a fake user into req.user so we can test item/claim
// routes without waiting for the auth system your friend is building.
// Replace this with the real JWT middleware once auth is pushed.

const MOCK_USER = {
  _id: "000000000000000000000001",
  name: "Aarav Sharma",
  email: "aarav.sharma@campus.edu",
  role: "student",
  mobile: "+91 98765 43210",
  department: "Computer Science",
  year: "2nd Year",
  idNumber: "CSE21042",
};

const MOCK_ADMIN = {
  _id: "000000000000000000000004",
  name: "Priya Desai",
  email: "priya.desai@campus.edu",
  role: "admin",
  mobile: "+91 99001 22334",
  department: "Administration",
  idNumber: "ADM0009",
};

/**
 * Attaches a mock user to every request.
 * Use header `x-mock-role: admin` to simulate admin access.
 */
export const mockAuth = (req, _res, next) => {
  const role = req.headers["x-mock-role"];
  req.user = role === "admin" || role === "staff" ? MOCK_ADMIN : MOCK_USER;
  next();
};

/**
 * Restrict access to certain roles.
 * Usage: router.use(authorize("admin", "staff"))
 */
export const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ success: false, message: "Not authenticated" });
    }
    if (roles.length && !roles.includes(req.user.role)) {
      return res.status(403).json({ success: false, message: "Insufficient permissions" });
    }
    next();
  };
};
