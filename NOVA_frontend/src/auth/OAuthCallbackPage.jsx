// ════════════════════════════════════════════════════════════════════
//  OAuth Callback Page — NOVA
//  Receives token + user from the backend redirect after Google OAuth,
//  stores them in localStorage (matching existing auth pattern),
//  updates AppContext, and navigates to /dashboard.
// ════════════════════════════════════════════════════════════════════

import { useEffect, useState } from "react";
import { useNavigate, useSearchParams, Link } from "react-router-dom";
import { useApp } from "@/context/AppContext";
import "./auth.css";

export default function OAuthCallbackPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { login } = useApp();
  const [error, setError] = useState("");

  useEffect(() => {
    const token = searchParams.get("token");
    const userParam = searchParams.get("user");
    const errorParam = searchParams.get("error");

    // ── Handle error redirect from backend ──────────────────────
    if (errorParam) {
      setError("Google sign-in failed. Please try again.");
      return;
    }

    // ── Validate that we received both token and user ───────────
    if (!token || !userParam) {
      setError("Invalid authentication response. Please try signing in again.");
      return;
    }

    try {
      const user = JSON.parse(decodeURIComponent(userParam));

      // ── Store auth state (matches LoginPage / SignupPage pattern) ──
      localStorage.setItem("cf_token", token);
      localStorage.setItem("cf_user", JSON.stringify(user));

      // ── Update React auth context ─────────────────────────────
      login(user);

      // ── Navigate to dashboard ─────────────────────────────────
      navigate("/dashboard", { replace: true });
    } catch (err) {
      console.error("OAuth callback error:", err);
      setError("Something went wrong processing your sign-in. Please try again.");
    }
  }, [searchParams, login, navigate]);

  // ── Error state ───────────────────────────────────────────────
  if (error) {
    return (
      <div className="auth-layout">
        <main className="auth-right" style={{ width: "100%" }}>
          <div className="auth-form-wrap" style={{ textAlign: "center" }}>
            <p className="auth-eyebrow">■ AUTHENTICATION</p>
            <h2 className="auth-title">Sign-in failed</h2>
            <div className="auth-error" role="alert" aria-live="polite">
              {error}
            </div>
            <Link to="/login" className="auth-btn-primary" style={{ textDecoration: "none", marginTop: 24, display: "inline-flex" }}>
              <span>Back to sign in</span>
              <span className="auth-btn-badge" aria-hidden="true">→</span>
            </Link>
          </div>
        </main>
      </div>
    );
  }

  // ── Loading state (while processing the redirect) ─────────────
  return (
    <div className="auth-layout">
      <main className="auth-right" style={{ width: "100%" }}>
        <div className="auth-form-wrap" style={{ textAlign: "center" }}>
          <p className="auth-eyebrow">■ SIGNING IN</p>
          <h2 className="auth-title">Completing sign-in…</h2>
          <p className="auth-subtitle">
            Please wait while we set up your session.
          </p>
          {/* Simple CSS spinner using existing brand tokens */}
          <div
            className="oauth-spinner"
            role="status"
            aria-label="Loading"
          />
        </div>
      </main>
    </div>
  );
}
