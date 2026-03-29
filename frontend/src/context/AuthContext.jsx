import { createContext, useContext, useEffect, useState } from "react"
import { supabase } from "../supabase/supabaseClient"

export const AuthContext = createContext()

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null)
  const [role, setRole] = useState(null)
  const [loading, setLoading] = useState(true)
  
  const fetchRole = async (userId) => {
    try {
      const { data, error } = await supabase
        .from('users')
        .select('role')
        .eq('user_id', userId)
        .maybeSingle()

      if (error) {
        console.error('fetchRole error:', error)
        setRole(null)
        return
      }

      setRole(data?.role ?? null)
    } catch (err) {
      console.error('fetchRole catch:', err)
      setRole(null)
    }
  }

  useEffect(() => {
    const timeout = setTimeout(() => {
      console.warn('Auth timeout hit')
      setLoading(false)
    }, 5000)

    supabase.auth.getSession().then(({ data: { session }, error }) => {
      if (error) console.error('getSession error:', error)

      setUser(session?.user ?? null)

      if (session?.user) {
        fetchRole(session.user.id)
      }

      clearTimeout(timeout)
      setLoading(false)
    })

    const { data: listener } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setUser(session?.user ?? null)
        if (session?.user) fetchRole(session.user.id)
        else setRole(null)
      }
    )

    return () => {
      clearTimeout(timeout)
      listener.subscription.unsubscribe()
    }
  }, [])

  return (
    <AuthContext.Provider value={{ user, role, loading }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext)