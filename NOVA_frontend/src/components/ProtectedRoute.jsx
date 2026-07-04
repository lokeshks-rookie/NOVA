import { Navigate, useLocation } from "react-router-dom"
import { useApp } from "@/context/AppContext"

/*
  ProtectedRoute — wraps authenticated routes.
  Redirects to /login if no cf_token is found (via user state derived from localStorage).
  Optionally role-gates a route (e.g. admin panel).
*/
export function ProtectedRoute({ children, roles }) {
  const { user } = useApp()
  const location = useLocation()

  if (!user) {
    // NAV → /login — no token found, send unauthenticated users to sign in
    return <Navigate to="/login" replace state={{ from: location.pathname }} />
  }

  if (roles && !roles.includes(user.role)) {
    // NAV → /dashboard — authenticated but lacks the required role for this route
    return <Navigate to="/dashboard" replace />
  }

  return children
}
