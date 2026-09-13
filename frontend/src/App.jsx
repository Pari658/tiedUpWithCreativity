import React from 'react'
import { BrowserRouter as Router, Routes, Route } from "react-router-dom"
import { AuthProvider } from './context/AuthContext'
import AppLayout from './components/layout/AppLayout'
import DashboardLayout from './components/layout/DashboardLayout'
import ProtectedRoute, { AdminRoute } from './components/auth/protectedRoute'

// Public pages
import HomePage from "./pages/HomePage"
import LoginPage from "./pages/LoginPage"

// Admin pages
import AdminDashboard from './pages/Admin/AdminDashboard'
import AddCategory from './pages/Admin/AddCategory'
import AddProduct from './pages/Admin/AddProduct'
import Coupons from './pages/Admin/coupons'
import Customers from './pages/Admin/customers'
import Orders from './pages/Admin/orders'
import Reviews from './pages/Admin/reviews'

// User pages
import UserDashboard from "./pages/User/UserDashboard"
import CartPage from "./pages/User/CartPage"
import ProfilePage from './pages/User/ProfilePage'
import YourOrders from './pages/User/YourOrders'
import Customize from './pages/User/Customize'


const App = () => {
  return (
    <AuthProvider>
      <Router>
        <Routes>

          {/* Public */}
          <Route path="/" element={<HomePage />} />
          <Route path="/login" element={<LoginPage />} />

          {/* Admin — with layout, protected */}
          <Route path="/admin" element={<AppLayout />}>
            <Route path="dashboard" element={
              <AdminRoute><AdminDashboard /></AdminRoute>
            }/>
            <Route path="add-product" element={
              <AdminRoute><AddProduct /></AdminRoute>
            }/>
            <Route path="add-category" element={
              <AdminRoute><AddCategory /></AdminRoute>
            }/>
            <Route path="orders" element={
              <AdminRoute><Orders /></AdminRoute>
            }/>
            <Route path="customers" element={
              <AdminRoute><Customers /></AdminRoute>
            }/>
            <Route path="reviews" element={
              <AdminRoute><Reviews /></AdminRoute>
            }/>
            <Route path="coupons" element={
              <AdminRoute><Coupons /></AdminRoute>
            }/>
          </Route>

          {/* User Dashboard — protected layout route with nested children */}
          <Route path="/dashboard" element={
            <ProtectedRoute><DashboardLayout /></ProtectedRoute>
          }>
            <Route index element={<UserDashboard />} />
            <Route path="profile" element={<ProfilePage />} />
            <Route path="cart" element={<CartPage />} />
            <Route path="orders" element={<YourOrders />} />
          </Route>

          {/* Direct shortcuts for legacy top-level paths */}
          <Route path="/cart" element={<ProtectedRoute><DashboardLayout><CartPage /></DashboardLayout></ProtectedRoute>} />
          <Route path="/profile" element={<ProtectedRoute><DashboardLayout><ProfilePage /></DashboardLayout></ProtectedRoute>} />
          <Route path="/orders" element={<ProtectedRoute><DashboardLayout><YourOrders /></DashboardLayout></ProtectedRoute>} />

        </Routes>
      </Router>
    </AuthProvider>
  )
}

export default App