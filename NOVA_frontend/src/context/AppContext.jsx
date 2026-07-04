import { createContext, useContext, useReducer, useCallback, useState, useEffect } from "react"
import { CATEGORIES, LOCATIONS } from "@/data/mock"
import api from "@/lib/api"

// ─── Global auth + UI state via Context API + useReducer ───────────────────

const AppContext = createContext(null)

const TOKEN_KEY = "cf_token"
const USER_KEY = "cf_user"

function getInitialUser() {
  if (typeof window === "undefined") return null
  const token = localStorage.getItem(TOKEN_KEY)
  const userStr = localStorage.getItem(USER_KEY)
  if (token && userStr) {
    try {
      return JSON.parse(userStr)
    } catch {
      return null
    }
  }
  return null
}

const initialState = {
  user: getInitialUser(),
  notifications: [],
  savedSearches: [],
  toasts: [],
}

function reducer(state, action) {
  switch (action.type) {
    case "LOGIN":
      return { ...state, user: action.payload }
    case "LOGOUT":
      return { ...state, user: null, notifications: [], savedSearches: [] }
    case "UPDATE_USER":
      return { ...state, user: { ...state.user, ...action.payload } }
    case "SET_NOTIFICATIONS":
      return { ...state, notifications: action.payload }
    case "MARK_ALL_READ":
      return { ...state, notifications: state.notifications.map((n) => ({ ...n, read: true })) }
    case "MARK_READ":
      return {
        ...state,
        notifications: state.notifications.map((n) => (n.id === action.payload ? { ...n, read: true } : n)),
      }
    case "SET_SAVED_SEARCHES":
      return { ...state, savedSearches: action.payload }
    case "TOGGLE_SAVED_SEARCH":
      return {
        ...state,
        savedSearches: state.savedSearches.map((s) =>
          s.id === action.payload ? { ...s, enabled: !s.enabled } : s,
        ),
      }
    case "ADD_SAVED_SEARCH":
      return { ...state, savedSearches: [...state.savedSearches, action.payload] }
    case "DELETE_SAVED_SEARCH":
      return { ...state, savedSearches: state.savedSearches.filter((s) => s.id !== action.payload) }
    case "ADD_TOAST":
      return { ...state, toasts: [...state.toasts, action.payload] }
    case "REMOVE_TOAST":
      return { ...state, toasts: state.toasts.filter((t) => t.id !== action.payload) }
    default:
      return state
  }
}

export function AppProvider({ children }) {
  const [state, dispatch] = useReducer(reducer, initialState)

  // ─── Theme state (persisted in localStorage) ─────────────────────
  const [theme, setThemeState] = useState(() => {
    if (typeof window !== "undefined") {
      return localStorage.getItem("cf_theme") || "light"
    }
    return "light"
  })

  const setTheme = useCallback((t) => {
    setThemeState(t)
    localStorage.setItem("cf_theme", t)
  }, [])

  // Sync theme class on <html> element
  useEffect(() => {
    const root = document.documentElement
    if (theme === "dark") {
      root.classList.add("dark")
    } else {
      root.classList.remove("dark")
    }
  }, [theme])

  // ─── Fetch notifications + saved searches when user is logged in ──
  useEffect(() => {
    if (!state.user) return

    api.get("/notifications").then((res) => {
      const notifs = (res?.data || []).map((n) => ({
        id: n._id || n.id,
        type: n.type,
        title: n.title,
        body: n.body || n.message,
        date: n.createdAt || n.date,
        read: n.read,
      }))
      dispatch({ type: "SET_NOTIFICATIONS", payload: notifs })
    }).catch(() => {})

    api.get("/search-alerts").then((res) => {
      const alerts = (res?.data || []).map((a) => ({
        id: a._id || a.id,
        query: a.queryText || a.query,
        category: a.category || "all",
        enabled: a.status === "active",
        newMatches: a.newMatches || 0,
      }))
      dispatch({ type: "SET_SAVED_SEARCHES", payload: alerts })
    }).catch(() => {})
  }, [state.user])

  const login = useCallback((user) => {
    // Token is already stored by LoginPage / OAuthCallbackPage
    localStorage.setItem(USER_KEY, JSON.stringify(user))
    if (!localStorage.getItem(TOKEN_KEY)) {
      localStorage.setItem(TOKEN_KEY, "pending")
    }
    dispatch({ type: "LOGIN", payload: user })
  }, [])

  const logout = useCallback(() => {
    localStorage.removeItem(TOKEN_KEY)
    localStorage.removeItem(USER_KEY)
    setTheme("light")
    dispatch({ type: "LOGOUT" })
  }, [setTheme])

  const updateUser = useCallback((patch) => dispatch({ type: "UPDATE_USER", payload: patch }), [])

  const addToast = useCallback((toast) => {
    const id = `t-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`
    dispatch({ type: "ADD_TOAST", payload: { id, ...toast } })
    // Auto-dismiss after 4s (NotificationToast spec)
    setTimeout(() => dispatch({ type: "REMOVE_TOAST", payload: id }), 4000)
  }, [])

  const removeToast = useCallback((id) => dispatch({ type: "REMOVE_TOAST", payload: id }), [])

  // ─── API-backed actions ─────────────────────────────────────────
  const markAllRead = useCallback(() => {
    api.patch("/notifications/read-all").catch(() => {})
    dispatch({ type: "MARK_ALL_READ" })
  }, [])

  const markRead = useCallback((id) => {
    api.patch(`/notifications/${id}/read`).catch(() => {})
    dispatch({ type: "MARK_READ", payload: id })
  }, [])

  const toggleSavedSearch = useCallback((id) => {
    api.patch(`/search-alerts/${id}/toggle`).catch(() => {})
    dispatch({ type: "TOGGLE_SAVED_SEARCH", payload: id })
  }, [])

  const addSavedSearch = useCallback(async (s) => {
    try {
      const res = await api.post("/search-alerts", { queryText: s.query, category: s.category })
      const saved = res?.data
      dispatch({
        type: "ADD_SAVED_SEARCH",
        payload: {
          id: saved?._id || saved?.id || s.id,
          query: saved?.queryText || s.query,
          category: saved?.category || s.category,
          enabled: true,
          newMatches: 0,
        },
      })
    } catch {
      // Fallback to local-only
      dispatch({ type: "ADD_SAVED_SEARCH", payload: s })
    }
  }, [])

  const deleteSavedSearch = useCallback((id) => {
    api.delete(`/search-alerts/${id}`).catch(() => {})
    dispatch({ type: "DELETE_SAVED_SEARCH", payload: id })
  }, [])

  const value = {
    ...state,
    unreadCount: state.notifications.filter((n) => !n.read).length,
    theme,
    setTheme,
    login,
    logout,
    updateUser,
    addToast,
    removeToast,
    markAllRead,
    markRead,
    toggleSavedSearch,
    addSavedSearch,
    deleteSavedSearch,
  }

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>
}

export function useApp() {
  const ctx = useContext(AppContext)
  if (!ctx) throw new Error("useApp must be used within AppProvider")
  return ctx
}
