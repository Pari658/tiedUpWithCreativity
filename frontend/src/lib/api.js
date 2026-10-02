const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001'

// ── In-memory access token store ─────────────────────────────────────────────
let accessToken = null

export function setAccessToken(token) { accessToken = token }
export function getAccessToken() { return accessToken }
export function clearAccessToken() { accessToken = null }

// ── Error class ──────────────────────────────────────────────────────────────
export class ApiError extends Error {
  constructor(status, message, field = null) {
    super(message)
    this.name = 'ApiError'
    this.status = status
    this.field = field
  }
}

// ── Silent refresh (deduped) ─────────────────────────────────────────────────
let refreshPromise = null

async function refreshAccessToken() {
  // If a refresh is already in flight, piggy-back on it
  if (refreshPromise) return refreshPromise

  refreshPromise = (async () => {
    try {
      const res = await fetch(`${API_URL}/api/auth/refresh`, {
        method: 'POST',
        credentials: 'include', // sends the httpOnly refreshToken cookie
      })
      if (!res.ok) {
        accessToken = null
        return false
      }
      const data = await res.json()
      accessToken = data.accessToken
      return true
    } catch {
      accessToken = null
      return false
    } finally {
      refreshPromise = null
    }
  })()

  return refreshPromise
}

// ── Main fetch wrapper ───────────────────────────────────────────────────────
export async function fetchApi(path, options = {}) {
  const buildHeaders = () => ({
    ...(options.body instanceof FormData ? {} : { 'Content-Type': 'application/json' }),
    ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
    ...options.headers,
  })

  const makeRequest = () =>
    fetch(`${API_URL}${path}`, {
      ...options,
      credentials: 'include',
      headers: buildHeaders(),
    })

  let res = await makeRequest()

  // On 401, try a silent refresh and retry once (skip if this IS the refresh call)
  if (res.status === 401 && !path.includes('/auth/refresh')) {
    const refreshed = await refreshAccessToken()
    if (refreshed) {
      res = await makeRequest()
    }
  }

  if (!res.ok) {
    const body = await res.json().catch(() => ({}))
    throw new ApiError(res.status, body.error || 'Something went wrong', body.field || null)
  }

  if (res.status === 204) return null
  return res.json()
}
