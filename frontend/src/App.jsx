import React from 'react'
import { BrowserRouter as Router, Routes, Route } from "react-router-dom"
import { AuthProvider } from './context/AuthContext'
import AppLayout from './components/layout/AppLayout'
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
import ProfilePage from './pages/User/ProfilePage';
import YourOrders from './pages/User/YourOrders';
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

          {/* User — protected */}
          <Route path="/dashboard" element={
            <ProtectedRoute><UserDashboard /></ProtectedRoute>
          }/>
          <Route path="/cart" element={
            <ProtectedRoute><CartPage /></ProtectedRoute>
          }/>
          <Route path="/profile" element={
            <ProtectedRoute><ProfilePage /></ProtectedRoute>
          }/>
          <Route path="/orders" element={
            <ProtectedRoute><YourOrders /></ProtectedRoute>
          }/>

        </Routes>
      </Router>
    </AuthProvider>
  )
}

export default App