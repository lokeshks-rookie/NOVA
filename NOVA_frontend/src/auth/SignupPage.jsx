// ════════════════════════════════════════════════════════════════════
//  Signup Page — Campus Lost & Found System (NOVA)
//  Tech stack : React + React Router (Vite)
//  Style file : auth.css (shared with LoginPage)
// ════════════════════════════════════════════════════════════════════
//
//  ─── NAVIGATION MAP ──────────────────────────────────────────────
//  [Logo click]             → /              (LandingPage)
//  [Sign in link]           → /login         (LoginPage)
//  [Successful signup]      → /dashboard     (DashboardPage)
//                             !! NEVER redirects to /login after signup.
//                             Token is set immediately; user lands in app.
//  [Google OAuth success]   → /dashboard     (via /api/auth/google/callback)
//  [Terms link]             → /terms
//  [Privacy link]           → /privacy
//  ─────────────────────────────────────────────────────────────────

import { useState, useEffect } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { useApp } from "@/context/AppContext";
import api from "@/lib/api";
import "./auth.css";

// ─── Constants ────────────────────────────────────────────────────
const ROLES = [
  { id: "student", label: "Student" },
  { id: "professor", label: "Professor" },
  { id: "staff", label: "Staff" },
  { id: "other", label: "Other" },
];

const DEPARTMENTS = [
  "Computer Science & Engineering",
  "Electronics & Communication",
  "Mechanical Engineering",
  "Civil Engineering",
  "Information Technology",
  "Electrical Engineering",
  "Applied Sciences & Humanities",
  "Business Administration",
  "Other",
];

const YEARS = [
  "1st Year",
  "2nd Year",
  "3rd Year",
  "4th Year",
  "PG — 1st Year",
  "PG — 2nd Year",
  "PhD",
];

// ─── Google SVG Icon ──────────────────────────────────────────────
const GoogleIcon = () => (
  <svg
    width="18"
    height="18"
    viewBox="0 0 24 24"
    xmlns="http://www.w3.org/2000/svg"
    aria-hidden="true"
    focusable="false"
  >
    <path
      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
      fill="#4285F4"
    />
    <path
      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
      fill="#34A853"
    />
    <path
      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
      fill="#FBBC05"
    />
    <path
      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
      fill="#EA4335"
    />
  </svg>
);

// ════════════════════════════════════════════════════════════════════
//  Component
// ════════════════════════════════════════════════════════════════════
export default function SignupPage() {
  const navigate = useNavigate();
  const { login } = useApp();

  const [searchParams] = useSearchParams();

  const [role, setRole] = useState("student");

  const [form, setForm] = useState({
    fullName: "",
    email: "",
    mobile: "",
    department: "",
    studentId: "",   // student & staff use this; professors use employeeId
    employeeId: "",
    yearOfStudy: "",
    password: "",
    confirmPw: "",
  });

  const [showPw, setShowPw] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // ─── Show error from Google OAuth redirect ──────────────────
  useEffect(() => {
    const oauthError = searchParams.get("error");
    if (oauthError === "google_auth_failed") {
      setError("Google sign-in failed. Please try again.");
    }
  }, [searchParams]);

  // ─── Handlers ─────────────────────────────────────────────────
  const handleChange = (e) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    if (error) setError("");
  };

  const handleRoleSelect = (id) => {
    setRole(id);
    if (error) setError("");
  };

  // ─── Validation ───────────────────────────────────────────────
  const validate = () => {
    if (!form.fullName.trim())
      return "Full name is required.";

    if (!form.email.trim() || !/\S+@\S+\.\S+/.test(form.email))
      return "Enter a valid email address.";

    if (!form.mobile.trim() || !/^\d{10}$/.test(form.mobile))
      return "Enter a valid 10-digit mobile number.";

    if (!form.department)
      return "Please select your department.";

    if (role === "student") {
      if (!form.studentId.trim())
        return "Student ID is required.";
      if (!form.yearOfStudy)
        return "Please select your year of study.";
    }

    if (role === "professor" || role === "staff") {
      if (!form.employeeId.trim())
        return "Employee ID is required.";
    }

    if (!form.password)
      return "Password is required.";
    if (form.password.length < 8)
      return "Password must be at least 8 characters.";
    if (form.password !== form.confirmPw)
      return "Passwords do not match.";

    return null;
  };

  // ─── Submit ───────────────────────────────────────────────────
  const handleSubmit = async (e) => {
    e.preventDefault();

    const validationError = validate();
    if (validationError) {
      setError(validationError);
      return;
    }

    setLoading(true);
    setError("");

    // Build payload — only send fields relevant to the selected role
    const payload = {
      role,
      fullName: form.fullName.trim(),
      email: form.email.trim().toLowerCase(),
      mobile: form.mobile.trim(),
      department: form.department,
      password: form.password,
      ...(role === "student" && { studentId: form.studentId.trim(), yearOfStudy: form.yearOfStudy }),
      ...(role === "professor" && { employeeId: form.employeeId.trim() }),
      ...(role === "staff" && { employeeId: form.employeeId.trim() }),
    };

    try {
      const data = await api.post("/auth/signup", payload);

      if (data.token) {
        localStorage.setItem("cf_token", data.token);
      }

      // Persist auth state immediately using Context
      login(data.user);

      // NAVIGATION → /dashboard (first-time user — never goes to /login)
      navigate("/dashboard");
    } catch (err) {
      setError(err.message || "Signup failed.");
    } finally {
      setLoading(false);
    }
  };

  // ─── Google OAuth ──────────────────────────────────────────────
  const handleGoogle = () => {
    // Initiates Google OAuth registration/login.
    // If the user is new, the backend creates their account automatically,
    // sets a JWT, and redirects to /dashboard.
    // If the user already exists, they are logged in and sent to /dashboard.
    // NAVIGATION → /api/auth/google → Google consent → /dashboard
    window.location.href = `${import.meta.env.VITE_API_BASE_URL}/api/auth/google`;
  };

  // ─── Derived helpers ──────────────────────────────────────────
  const isStudent = role === "student";
  const isEmployee = role === "professor" || role === "staff";

  const idFieldLabel = isStudent
    ? "Student ID"
    : isEmployee
      ? "Employee ID"
      : null;

  const idFieldName = isStudent ? "studentId" : "employeeId";

  // ════════════════════════════════════════════════════════════════
  //  Render
  // ════════════════════════════════════════════════════════════════
  return (
    <div className="auth-layout">

      {/* ════════════════════════ LEFT PANEL ════════════════════════ */}
      <aside className="auth-left" aria-hidden="true">
        <div className="auth-left-inner">

          {/* Logo — NAVIGATION → / (LandingPage) */}
          <Link to="/" className="auth-logo" tabIndex={-1}>
            <span className="auth-logo-mark">■</span>
            <span className="auth-logo-text">NOVA</span>
          </Link>

          {/* Main headline */}
          <div className="auth-left-body">
            <p className="auth-left-eyebrow">■ CAMPUS LOST &amp; FOUND</p>
            <h1 className="auth-left-headline">
              Report, search,<br />
              and claim what&apos;s<br />
              <span className="auth-left-accent">yours.</span>
            </h1>
          </div>

          {/* Stats */}
          <div className="auth-left-foot">
            <div className="auth-stat-row">
              <div className="auth-stat">
                <span className="auth-stat-num">1.2k</span>
                <span className="auth-stat-label">Campus members</span>
              </div>
              <div className="auth-stat-divider" />
              <div className="auth-stat">
                <span className="auth-stat-num">48h</span>
                <span className="auth-stat-label">Avg. resolution time</span>
              </div>
            </div>
          </div>

        </div>

        {/* Decorative circles */}
        <div className="auth-decor auth-decor--tl" />
        <div className="auth-decor auth-decor--br" />
      </aside>

      {/* ════════════════════════ RIGHT PANEL ════════════════════════ */}
      <main className="auth-right">
        <div className="auth-form-wrap">

          {/* Eyebrow */}
          <p className="auth-eyebrow">■ CREATE YOUR ACCOUNT</p>

          <h2 className="auth-title">Join your campus network</h2>

          <p className="auth-subtitle">
            Already have an account?{" "}
            {/* NAVIGATION → /login (LoginPage) */}
            <Link to="/login" className="auth-inline-link">Sign in</Link>
          </p>

          {/* Error banner */}
          {error && (
            <div className="auth-error" role="alert" aria-live="polite">
              {error}
            </div>
          )}

          {/* ─── Signup form ─── */}
          <form onSubmit={handleSubmit} noValidate className="auth-form">

            {/* ── Step 1: Role selection ── */}
            <div className="auth-role-group">
              <span className="auth-role-label">I am a</span>
              <div className="auth-roles" role="group" aria-label="Select your role">
                {ROLES.map((r) => (
                  <button
                    key={r.id}
                    type="button"
                    className={`auth-role-pill${role === r.id ? " auth-role-pill--active" : ""}`}
                    onClick={() => handleRoleSelect(r.id)}
                    aria-pressed={role === r.id}
                  >
                    {r.label}
                  </button>
                ))}
              </div>
            </div>

            {/* ── Step 2: Core details — 2-column grid ── */}
            <div className="auth-grid-2">

              {/* Full name */}
              <div className="auth-field auth-field--full">
                <label htmlFor="fullName" className="auth-label">Full name</label>
                <input
                  id="fullName"
                  name="fullName"
                  type="text"
                  value={form.fullName}
                  onChange={handleChange}
                  placeholder="As per college records"
                  className="auth-input"
                  autoComplete="name"
                  required
                />
              </div>

              {/* Email */}
              <div className="auth-field">
                <label htmlFor="email" className="auth-label">Email address</label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  value={form.email}
                  onChange={handleChange}
                  placeholder="you@college.edu"
                  className="auth-input"
                  autoComplete="email"
                  inputMode="email"
                  required
                />
              </div>

              {/* Mobile number — WhatsApp / SMS notifications will use this */}
              <div className="auth-field">
                <label htmlFor="mobile" className="auth-label">
                  Mobile number
                  <span style={{ fontWeight: 400, color: "#75797B", marginLeft: 6, fontSize: 12 }}>
                    (for WhatsApp / SMS)
                  </span>
                </label>
                <div className="auth-phone-wrap">
                  <span className="auth-phone-prefix">+91</span>
                  <input
                    id="mobile"
                    name="mobile"
                    type="tel"
                    value={form.mobile}
                    onChange={handleChange}
                    placeholder="10-digit number"
                    className="auth-input auth-phone-input"
                    autoComplete="tel"
                    inputMode="numeric"
                    maxLength={10}
                    pattern="\d{10}"
                    required
                  />
                </div>
              </div>

              {/* Department */}
              <div className="auth-field">
                <label htmlFor="department" className="auth-label">Department</label>
                <select
                  id="department"
                  name="department"
                  value={form.department}
                  onChange={handleChange}
                  className="auth-select"
                  required
                >
                  <option value="" disabled>Select department</option>
                  {DEPARTMENTS.map((d) => (
                    <option key={d} value={d}>{d}</option>
                  ))}
                </select>
              </div>

              {/* Student ID — shown for student role only */}
              {isStudent && (
                <div className="auth-field">
                  <label htmlFor="studentId" className="auth-label">Student ID</label>
                  <input
                    id="studentId"
                    name="studentId"
                    type="text"
                    value={form.studentId}
                    onChange={handleChange}
                    placeholder="e.g. 22CS1234"
                    className="auth-input"
                    required={isStudent}
                  />
                </div>
              )}

              {/* Year of study — shown for student role only */}
              {isStudent && (
                <div className="auth-field">
                  <label htmlFor="yearOfStudy" className="auth-label">Year of study</label>
                  <select
                    id="yearOfStudy"
                    name="yearOfStudy"
                    value={form.yearOfStudy}
                    onChange={handleChange}
                    className="auth-select"
                    required={isStudent}
                  >
                    <option value="" disabled>Select year</option>
                    {YEARS.map((y) => (
                      <option key={y} value={y}>{y}</option>
                    ))}
                  </select>
                </div>
              )}

              {/* Employee ID — shown for professor & staff roles */}
              {isEmployee && (
                <div className="auth-field auth-field--full">
                  <label htmlFor={idFieldName} className="auth-label">{idFieldLabel}</label>
                  <input
                    id={idFieldName}
                    name={idFieldName}
                    type="text"
                    value={form[idFieldName]}
                    onChange={handleChange}
                    placeholder="e.g. EMP-2024-001"
                    className="auth-input"
                    required={isEmployee}
                  />
                </div>
              )}

              {/* Password */}
              <div className="auth-field">
                <label htmlFor="password" className="auth-label">Password</label>
                <div className="auth-input-group">
                  <input
                    id="password"
                    name="password"
                    type={showPw ? "text" : "password"}
                    value={form.password}
                    onChange={handleChange}
                    placeholder="Min 8 characters"
                    className="auth-input auth-input--pw"
                    autoComplete="new-password"
                    required
                  />
                  <button
                    type="button"
                    className="auth-pw-toggle"
                    onClick={() => setShowPw((v) => !v)}
                    aria-label={showPw ? "Hide password" : "Show password"}
                  >
                    {showPw ? "Hide" : "Show"}
                  </button>
                </div>
              </div>

              {/* Confirm password */}
              <div className="auth-field">
                <label htmlFor="confirmPw" className="auth-label">Confirm password</label>
                <div className="auth-input-group">
                  <input
                    id="confirmPw"
                    name="confirmPw"
                    type={showConfirm ? "text" : "password"}
                    value={form.confirmPw}
                    onChange={handleChange}
                    placeholder="Repeat password"
                    className="auth-input auth-input--pw"
                    autoComplete="new-password"
                    required
                  />
                  <button
                    type="button"
                    className="auth-pw-toggle"
                    onClick={() => setShowConfirm((v) => !v)}
                    aria-label={showConfirm ? "Hide confirm password" : "Show confirm password"}
                  >
                    {showConfirm ? "Hide" : "Show"}
                  </button>
                </div>
              </div>

            </div>
            {/* end .auth-grid-2 */}

            {/* Submit — NAVIGATION → /dashboard on success (never to /login) */}
            <button
              type="submit"
              className="auth-btn-primary"
              disabled={loading}
              aria-busy={loading}
            >
              <span>{loading ? "Creating account..." : "Create account"}</span>
              <span className="auth-btn-badge" aria-hidden="true">→</span>
            </button>

          </form>

          {/* Divider */}
          <div className="auth-or" aria-hidden="true">
            <span>or</span>
          </div>

          {/* Google OAuth — NAVIGATION → /dashboard via backend callback */}
          <button
            type="button"
            className="auth-btn-google"
            onClick={handleGoogle}
          >
            <GoogleIcon />
            Continue with Google
          </button>

          {/* Terms */}
          <p className="auth-terms">
            By creating an account you agree to our{" "}
            {/* NAVIGATION → /terms */}
            <Link to="/terms">Terms of Service</Link>
            {" "}and{" "}
            {/* NAVIGATION → /privacy */}
            <Link to="/privacy">Privacy Policy</Link>.
          </p>

        </div>
      </main>

    </div>
  );
}
