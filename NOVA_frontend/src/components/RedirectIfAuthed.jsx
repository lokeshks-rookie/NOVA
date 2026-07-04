import { Navigate } from "react-router-dom"
import { useApp } from "@/context/AppContext"

// Sends already-authenticated users away from /login and /signup.
export function RedirectIfAuthed({ children }) {
  const { user } = useApp()
  // NAV → /dashboard — authed users shouldn't see auth pages
  if (user) return <Navigate to="/dashboard" replace />
  return children
}
