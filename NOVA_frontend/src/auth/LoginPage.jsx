// ════════════════════════════════════════════════════════════════════
//  Login Page — Campus Lost & Found System (NOVA)
//  Tech stack : React + React Router (Vite)
//  Style file : auth.css (shared with SignupPage)
// ════════════════════════════════════════════════════════════════════
//
//  ─── NAVIGATION MAP ──────────────────────────────────────────────
//  [Logo click]             → /              (LandingPage)
//  [Sign up link]           → /signup        (SignupPage)
//  [Forgot password link]   → /forgot-password
//  [Successful login]       → /dashboard     (DashboardPage)
//  [Google OAuth success]   → /dashboard     (via /api/auth/google/callback)
//  ─────────────────────────────────────────────────────────────────

import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import "./auth.css";

// ─── Google SVG Icon (no external dependency) ────────────────────
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
export default function LoginPage() {
  const navigate = useNavigate();

  // ─── Form state ───────────────────────────────────────────────
  const [form, setForm] = useState({ email: "", password: "" });
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // ─── Handlers ─────────────────────────────────────────────────
  const handleChange = (e) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    if (error) setError(""); // Clear error on new input
  };

  const validate = () => {
    if (!form.email.trim()) return "Email address is required.";
    if (!form.password.trim()) return "Password is required.";
    // Basic email format check — deeper validation happens server-side
    if (!/\S+@\S+\.\S+/.test(form.email)) return "Enter a valid email address.";
    return null;
  };

  // ─── Email / password submit ───────────────────────────────────
  const handleSubmit = async (e) => {
    e.preventDefault();

    // MOCK LOGIN FOR DEVELOPMENT - SKIP VALIDATION
    /*
    const validationError = validate();
    if (validationError) {
      setError(validationError);
      return;
    }
    */

    setLoading(true);
    setError("");

    try {
      // ── API: POST /api/auth/login
      // Request  body : { email, password }
      // Response body : { token: string, user: { _id, name, email, role, ... } }
      
      // MOCK LOGIN FOR DEVELOPMENT
      /*
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: form.email, password: form.password }),
      });

      const data = await res.json();

      if (!res.ok) throw new Error(data.message || "Login failed. Check your credentials.");
      */
      
      const data = {
        token: "mock-jwt-token-for-development",
        user: { _id: "mock-user-1", name: "Test User", email: form.email || "test@example.com", role: "student" }
      };

      // Persist auth state
      localStorage.setItem("cf_token", data.token);
      localStorage.setItem("cf_user", JSON.stringify(data.user));

      // NAVIGATION → /dashboard (on successful login)
      navigate("/dashboard");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Login failed.");
    } finally {
      setLoading(false);
    }
  };

  // ─── Google OAuth ──────────────────────────────────────────────
  const handleGoogle = () => {
    // Initiates Google OAuth.
    // Backend route /api/auth/google triggers Passport.js Google strategy.
    // On success, the callback /api/auth/google/callback sets the JWT and
    // redirects the browser to /dashboard.
    // NAVIGATION → /api/auth/google → Google consent → /dashboard
    window.location.href = "/api/auth/google";
  };

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
              Your lost items<br />
              find their<br />
              way <span className="auth-left-accent">home.</span>
            </h1>
          </div>

          {/* Social proof stats */}
          <div className="auth-left-foot">
            <div className="auth-stat-row">
              <div className="auth-stat">
                <span className="auth-stat-num">247</span>
                <span className="auth-stat-label">Items returned</span>
              </div>
              <div className="auth-stat-divider" />
              <div className="auth-stat">
                <span className="auth-stat-num">94%</span>
                <span className="auth-stat-label">Claim success rate</span>
              </div>
            </div>
          </div>

        </div>

        {/* Decorative circles (CSS-only, no images) */}
        <div className="auth-decor auth-decor--tl" />
        <div className="auth-decor auth-decor--br" />
      </aside>

      {/* ════════════════════════ RIGHT PANEL ════════════════════════ */}
      <main className="auth-right">
        <div className="auth-form-wrap">

          {/* Eyebrow label — matches brand convention */}
          <p className="auth-eyebrow">■ WELCOME BACK</p>

          <h2 className="auth-title">Sign in to your account</h2>

          <p className="auth-subtitle">
            Don&apos;t have an account?{" "}
            {/* NAVIGATION → /signup (SignupPage) */}
            <Link to="/signup" className="auth-inline-link">Sign up</Link>
          </p>

          {/* Error banner - Hiding for now as requested */}
          {/* {error && (
            <div className="auth-error" role="alert" aria-live="polite">
              {error}
            </div>
          )} */}

          {/* ─── Login form ─── */}
          <form onSubmit={handleSubmit} noValidate className="auth-form">

            {/* Email */}
            <div className="auth-field">
              <label htmlFor="login-email" className="auth-label">
                Email address
              </label>
              <input
                id="login-email"
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

            {/* Password */}
            <div className="auth-field">
              <div className="auth-label-row">
                <label htmlFor="login-password" className="auth-label">
                  Password
                </label>
                {/* NAVIGATION → /forgot-password */}
                <Link to="/forgot-password" className="auth-forgot">
                  Forgot password?
                </Link>
              </div>
              <div className="auth-input-group">
                <input
                  id="login-password"
                  name="password"
                  type={showPw ? "text" : "password"}
                  value={form.password}
                  onChange={handleChange}
                  placeholder="Enter your password"
                  className="auth-input auth-input--pw"
                  autoComplete="current-password"
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

            {/* Submit — NAVIGATION → /dashboard on success */}
            <button
              type="submit"
              className="auth-btn-primary"
              disabled={loading}
              aria-busy={loading}
            >
              <span>{loading ? "Signing in..." : "Sign in"}</span>
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

        </div>
      </main>

    </div>
  );
}
