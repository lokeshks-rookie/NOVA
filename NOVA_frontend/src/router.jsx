import { createBrowserRouter, Navigate } from "react-router-dom"
import { ProtectedRoute } from "@/components/ProtectedRoute"
import { AppLayout } from "@/components/AppLayout"
import { RedirectIfAuthed } from "@/components/RedirectIfAuthed"

import LandingPage from "@/pages/LandingPage"
import LoginPage from "@/auth/LoginPage"
import SignupPage from "@/auth/SignupPage"
import ForgotPasswordPage from "@/pages/ForgotPasswordPage"
import TermsPage from "@/pages/TermsPage"
import PrivacyPage from "@/pages/PrivacyPage"
import DashboardPage from "@/pages/DashboardPage"
import ReportPage from "@/pages/ReportPage"
import SearchPage from "@/pages/SearchPage"
import ItemDetailPage from "@/pages/ItemDetailPage"
import ClaimPage from "@/pages/ClaimPage"
import MyClaimsPage from "@/pages/MyClaimsPage"
import AIAssistantPage from "@/pages/AIAssistantPage"
import NotificationsPage from "@/pages/NotificationsPage"
import ProfilePage from "@/pages/ProfilePage"
import AdminPage from "@/pages/AdminPage"

// Wraps an authenticated page in the sidebar/header shell + protection
const app = (el, roles) => (
  <ProtectedRoute roles={roles}>
    <AppLayout>{el}</AppLayout>
  </ProtectedRoute>
)

export const router = createBrowserRouter([
  // ── Public ───────────────────────────────────────────────────────────
  { path: "/", element: <LandingPage /> },
  { path: "/login", element: <RedirectIfAuthed><LoginPage /></RedirectIfAuthed> },
  { path: "/signup", element: <RedirectIfAuthed><SignupPage /></RedirectIfAuthed> },
  { path: "/forgot-password", element: <ForgotPasswordPage /> },
  { path: "/terms", element: <TermsPage /> },
  { path: "/privacy", element: <PrivacyPage /> },
  { path: "/search", element: <AppLayout><SearchPage /></AppLayout> },
  { path: "/items/:id", element: <ItemDetailPage /> },

  // ── Protected (wrapped in AppLayout) ──────────────────────────────────
  { path: "/dashboard", element: app(<DashboardPage />) },
  { path: "/report", element: app(<ReportPage />) },
  { path: "/my-claims", element: app(<MyClaimsPage />) },
  { path: "/ai", element: app(<AIAssistantPage />) },
  { path: "/notifications", element: app(<NotificationsPage />) },
  { path: "/profile", element: app(<ProfilePage />) },
  { path: "/admin", element: app(<AdminPage />, ["admin", "staff"]) },

  // ── Protected but full-screen (no sidebar) ────────────────────────────
  {
    path: "/claim/:itemId",
    element: (
      <ProtectedRoute>
        <ClaimPage />
      </ProtectedRoute>
    ),
  },

  // Fallback → landing
  { path: "*", element: <Navigate to="/" replace /> },
])
