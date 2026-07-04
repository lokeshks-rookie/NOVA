import { createContext, useContext, useReducer, useCallback, useState, useEffect } from "react"
import { currentUser, mockNotifications, mockSavedSearches } from "@/data/mock"

// ─── Global auth + UI state via Context API + useReducer ───────────────────

const AppContext = createContext(null)

const TOKEN_KEY = "cf_token"

function getInitialUser() {
  // A valid token in localStorage means the user is authenticated.
  const token = typeof window !== "undefined" ? localStorage.getItem(TOKEN_KEY) : null
  return token ? currentUser : null
}

const initialState = {
  user: getInitialUser(),
  notifications: mockNotifications,
  savedSearches: mockSavedSearches,
  toasts: [],
}

function reducer(state, action) {
  switch (action.type) {
    case "LOGIN":
      return { ...state, user: action.payload }
    case "LOGOUT":
      return { ...state, user: null }
    case "UPDATE_USER":
      return { ...state, user: { ...state.user, ...action.payload } }
    case "MARK_ALL_READ":
      return { ...state, notifications: state.notifications.map((n) => ({ ...n, read: true })) }
    case "MARK_READ":
      return {
        ...state,
        notifications: state.notifications.map((n) => (n.id === action.payload ? { ...n, read: true } : n)),
      }
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

  const login = useCallback((user = currentUser) => {
    localStorage.setItem(TOKEN_KEY, "mock-cf-token")
    dispatch({ type: "LOGIN", payload: user })
  }, [])

  const logout = useCallback(() => {
    localStorage.removeItem(TOKEN_KEY)
    dispatch({ type: "LOGOUT" })
  }, [])

  const updateUser = useCallback((patch) => dispatch({ type: "UPDATE_USER", payload: patch }), [])

  const addToast = useCallback((toast) => {
    const id = `t-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`
    dispatch({ type: "ADD_TOAST", payload: { id, ...toast } })
    // Auto-dismiss after 4s (NotificationToast spec)
    setTimeout(() => dispatch({ type: "REMOVE_TOAST", payload: id }), 4000)
  }, [])

  const removeToast = useCallback((id) => dispatch({ type: "REMOVE_TOAST", payload: id }), [])

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
    markAllRead: () => dispatch({ type: "MARK_ALL_READ" }),
    markRead: (id) => dispatch({ type: "MARK_READ", payload: id }),
    toggleSavedSearch: (id) => dispatch({ type: "TOGGLE_SAVED_SEARCH", payload: id }),
    addSavedSearch: (s) => dispatch({ type: "ADD_SAVED_SEARCH", payload: s }),
    deleteSavedSearch: (id) => dispatch({ type: "DELETE_SAVED_SEARCH", payload: id }),
  }

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>
}

export function useApp() {
  const ctx = useContext(AppContext)
  if (!ctx) throw new Error("useApp must be used within AppProvider")
  return ctx
}
