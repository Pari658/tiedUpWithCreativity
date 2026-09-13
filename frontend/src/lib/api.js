const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001'

// Single error class for all API errors
export class ApiError extends Error {
  constructor(status, message, field = null) {
    super(message)
    this.name = 'ApiError'
    this.status = status
    this.field = field
  }
}

export async function fetchApi(path, options = {}) {
  const res = await fetch(`${API_URL}${path}`, {
    credentials: 'include',
    headers: {
      ...(options.body instanceof FormData ? {} : { 'Content-Type': 'application/json' }),
      ...options.headers,
    },
    ...options,
  })

  if (!res.ok) {
    const body = await res.json().catch(() => ({}))
    throw new ApiError(res.status, body.error || 'Something went wrong', body.field || null)
  }

  if (res.status === 204) return null
  return res.json()
}
