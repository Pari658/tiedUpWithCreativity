import { createContext, useContext, useEffect, useState, useCallback } from "react"
import { fetchApi, clearAccessToken } from "../lib/api"

export const AuthContext = createContext()

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null)
  const [role, setRole] = useState(null)
  const [loading, setLoading] = useState(true)

  const refetchUser = useCallback(async () => {
    try {
      const profile = await fetchApi('/api/auth/me')
      setUser(profile)
      setRole(profile.role)
    } catch {
      setUser(null)
      setRole(null)
      clearAccessToken()
    } finally {
      setLoading(false)
    }
  }, [])

  // On mount, try to restore the session.
  // fetchApi will auto-refresh from the httpOnly cookie on 401.
  useEffect(() => {
    refetchUser()
  }, [])

  return (
    <AuthContext.Provider value={{ user, role, loading, refetchUser }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext)