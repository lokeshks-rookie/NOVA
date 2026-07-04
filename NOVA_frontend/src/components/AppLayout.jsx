import { useEffect, useRef, useState } from "react"
import { NavLink, useNavigate } from "react-router-dom"
import {
  LayoutDashboard,
  PlusCircle,
  Search,
  FileCheck,
  Sparkles,
  Bell,
  User,
  ShieldCheck,
  LogOut,
} from "lucide-react"
import { useApp } from "@/context/AppContext"
import { Logo } from "./Logo"
import { cn } from "@/lib/utils"

const NAV = [
  { to: "/dashboard", label: "Home", icon: LayoutDashboard },
  { to: "/report", label: "Report Item", icon: PlusCircle },
  { to: "/search", label: "Search Items", icon: Search },
  { to: "/my-claims", label: "My Claims", icon: FileCheck },
  { to: "/ai", label: "AI Assistant", icon: Sparkles },
  { to: "/notifications", label: "Notifications", icon: Bell, badge: true },
  { to: "/profile", label: "Profile", icon: User },
  { to: "/admin", label: "Admin Panel", icon: ShieldCheck, roles: ["admin", "staff"] },
]

// 5 primary tabs for the mobile bottom bar
const MOBILE_TABS = [
  { to: "/dashboard", label: "Home", icon: LayoutDashboard },
  { to: "/search", label: "Search", icon: Search },
  { to: "/report", label: "Report", icon: PlusCircle },
  { to: "/ai", label: "AI", icon: Sparkles },
  { to: "/profile", label: "Profile", icon: User },
]

function initials(name) {
  return name
    .split(" ")
    .map((w) => w[0])
    .slice(0, 2)
    .join("")
    .toUpperCase()
}

export function AppLayout({ children }) {
  const { user, logout, unreadCount } = useApp()
  const navigate = useNavigate()
  const visibleNav = NAV.filter((n) => !n.roles || n.roles.includes(user?.role))
  const [sidebarOpen, setSidebarOpen] = useState(true)

  // Bell shake when a new unread notification appears
  const bellRef = useRef(null)
  const prevUnread = useRef(unreadCount)
  const [shake, setShake] = useState(false)
  useEffect(() => {
    if (unreadCount > prevUnread.current) {
      setShake(true)
      const t = setTimeout(() => setShake(false), 600)
      return () => clearTimeout(t)
    }
    prevUnread.current = unreadCount
  }, [unreadCount])

  const handleLogout = () => {
    logout()
    // NAV → / — after signing out, return to the public landing page
    navigate("/")
  }

  return (
    <div className="flex min-h-screen bg-cf-cream">

      {/* ── Sidebar open button (visible when sidebar is closed) ──── */}
      {!sidebarOpen && (
        <button
          onClick={() => setSidebarOpen(true)}
          className="fixed z-50 left-3 top-3 hidden h-9 w-9 items-center justify-center rounded-lg bg-cf-white border border-cf-line shadow-sm transition-all duration-300 hover:bg-cf-cream lg:flex"
          aria-label="Open sidebar"
        >
          <img src="/icons/sidebar-open.png" alt="" className="h-5 w-5 dark:invert" />
        </button>
      )}

      {/* ── Desktop sidebar ─────────────────────────────────────────── */}
      <aside
        className={cn(
          "fixed inset-y-0 left-0 flex-col border-r border-cf-line bg-cf-white transition-all duration-300 lg:flex hidden",
          sidebarOpen ? "w-64 translate-x-0" : "w-64 -translate-x-full"
        )}
      >
        {/* Logo + close button row */}
        <div className="flex items-center justify-between border-b border-cf-line p-5">
          <Logo />
          <button
            onClick={() => setSidebarOpen(false)}
            className="flex h-8 w-8 items-center justify-center rounded-lg transition-colors hover:bg-cf-cream"
            aria-label="Close sidebar"
          >
            <img src="/icons/sidebar-close.png" alt="" className="h-5 w-5 dark:invert" />
          </button>
        </div>

        {/* User summary */}
        <div className="flex items-center gap-3 border-b border-cf-line p-5">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-cf-black text-sm font-semibold text-cf-white">
            {initials(user?.name || "U")}
          </div>
          <div className="min-w-0">
            <p className="truncate text-sm font-medium">{user?.name}</p>
            <span className="mt-0.5 inline-flex rounded-full bg-cf-cream px-2 py-0.5 text-[11px] font-medium capitalize text-cf-muted">
              {user?.role}
            </span>
          </div>
        </div>

        <nav className="flex-1 space-y-1 overflow-y-auto p-3">
          {visibleNav.map(({ to, label, icon: Icon, badge }) => (
            // NAV → {to} — primary sidebar navigation
            <NavLink
              key={to}
              to={to}
              className={({ isActive }) =>
                cn(
                  "relative flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
                  isActive
                    ? "border-l-[3px] border-cf-yellow bg-cf-black pl-[9px] text-cf-white"
                    : "text-cf-muted hover:bg-cf-cream hover:text-cf-black",
                )
              }
            >
              <span ref={label === "Notifications" ? bellRef : null} className={cn(badge && shake && "cf-shake")}>
                <Icon className="h-5 w-5" strokeWidth={1.75} />
              </span>
              {label}
              {badge && unreadCount > 0 && (
                <span className="ml-auto flex h-5 min-w-5 items-center justify-center rounded-full bg-cf-yellow px-1.5 text-[11px] font-semibold text-cf-black">
                  {unreadCount}
                </span>
              )}
            </NavLink>
          ))}
        </nav>

        <div className="border-t border-cf-line p-3">
          <button
            onClick={handleLogout}
            className="cf-focus-ring flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-cf-muted hover:bg-cf-cream hover:text-cf-black"
          >
            <LogOut className="h-5 w-5" strokeWidth={1.75} />
            Sign out
          </button>
        </div>
      </aside>

      {/* ── Main content ────────────────────────────────────────────── */}
      <div className={cn("flex min-h-screen flex-1 flex-col transition-all duration-300", sidebarOpen ? "lg:pl-64" : "lg:pl-0")}>
        {/* Mobile top bar */}
        <header className="sticky top-0 z-30 flex items-center justify-between border-b border-cf-line bg-cf-white px-5 py-3 lg:hidden">
          <Logo />
          {/* NAV → /notifications — quick access to notifications on mobile */}
          <NavLink
            to="/notifications"
            aria-label="Notifications"
            className="relative rounded-full p-2 text-cf-black hover:bg-cf-cream"
          >
            <Bell className={cn("h-5 w-5", shake && "cf-shake")} strokeWidth={1.75} />
            {unreadCount > 0 && (
              <span className="absolute right-1 top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-cf-yellow px-1 text-[10px] font-semibold text-cf-black">
                {unreadCount}
              </span>
            )}
          </NavLink>
        </header>

        <main className="flex-1 cf-fade-in p-5 pb-24 sm:p-8 lg:pb-8">{children}</main>
      </div>

      {/* ── Mobile bottom tab bar (5 tabs) ──────────────────────────── */}
      <nav className="fixed inset-x-0 bottom-0 z-40 flex items-center justify-around border-t border-cf-line bg-cf-white lg:hidden">
        {MOBILE_TABS.map(({ to, label, icon: Icon }) => (
          // NAV → {to} — mobile primary tab
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) =>
              cn(
                "flex flex-1 flex-col items-center gap-1 py-2.5 text-[11px] font-medium",
                isActive ? "text-cf-black" : "text-cf-muted",
              )
            }
          >
            {({ isActive }) => (
              <>
                <span
                  className={cn(
                    "flex h-7 w-10 items-center justify-center rounded-full",
                    isActive && "bg-cf-yellow",
                  )}
                >
                  <Icon className="h-5 w-5" strokeWidth={1.75} />
                </span>
                {label}
              </>
            )}
          </NavLink>
        ))}
      </nav>
    </div>
  )
}
