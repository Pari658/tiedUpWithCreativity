import { createContext, useContext, useEffect, useState, useCallback } from "react"
import { fetchApi } from "../lib/api"

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
    } finally {
      setLoading(false)
    }
  }, [])

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