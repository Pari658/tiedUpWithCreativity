import { Navigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'

const ProtectedRoute = ({ children }) => {
  const { user, loading } = useAuth()
  if (loading) return <div>Loading...</div>
  if (!user) return <Navigate to="/login" />
  return children
}

export const AdminRoute = ({ children }) => {
  const { user, role, loading } = useAuth()
  if (loading) return <div>Loading...</div>
  if (!user || role !== 'admin') return <Navigate to="/" />
  return children
}

export default ProtectedRoute