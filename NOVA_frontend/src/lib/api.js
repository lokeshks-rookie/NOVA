// ─── NOVA API Client ───────────────────────────────────────────────────────
// Thin wrapper around fetch() that auto-attaches JWT and handles JSON.
// Usage:  import api from "@/lib/api"
//         const items = await api.get("/items?q=airpods")
//         const newItem = await api.post("/items", { title: "..." })

const BASE_URL = "/api"

class ApiError extends Error {
  constructor(message, status, data) {
    super(message)
    this.name = "ApiError"
    this.status = status
    this.data = data
  }
}

async function request(method, path, body = null) {
  const token = localStorage.getItem("cf_token")

  const headers = { "Content-Type": "application/json" }
  if (token) headers["Authorization"] = `Bearer ${token}`

  const config = { method, headers }
  if (body) config.body = JSON.stringify(body)

  const res = await fetch(`${BASE_URL}${path}`, config)

  // Handle 204 No Content
  if (res.status === 204) return null

  const data = await res.json().catch(() => null)

  if (!res.ok) {
    throw new ApiError(
      data?.message || `Request failed (${res.status})`,
      res.status,
      data,
    )
  }

  return data
}

const api = {
  get: (path) => request("GET", path),
  post: (path, body) => request("POST", path, body),
  patch: (path, body) => request("PATCH", path, body),
  delete: (path) => request("DELETE", path),
}

export default api
export { ApiError }
