import React from 'react'
import { BrowserRouter as Router , Routes , Route , Navigate } from "react-router-dom";

import HomePage from "./pages/HomePage"
import LoginPage from "./pages/LoginPage"
import UserDashboard from "./pages/UserDashboard"
import ProtectedRoute from './components/auth/protectedRoute';

import Applayout from './components/layout/AppLayout';

import AdminDashboard from './pages/Admin/AdminDashboard';
import AddCategory from './pages/Admin/AddCategory';
import AddProduct from './pages/Admin/AddProduct';
import Coupons from './pages/Admin/coupons';
import Customers from './pages/Admin/customers';
import Orders from './pages/Admin/orders';
import Reviews from './pages/Admin/reviews';

const App = () => {
  return (
   <Router>
      <Routes>
          <Route path = "/" element = {<HomePage />} />
          <Route path = "/login" element = {<LoginPage />} />
          <Route path = "/dashboard" element = {<ProtectedRoute><UserDashboard /> </ProtectedRoute>} />

          <Route path = "/admin" element = {<Applayout />} >\
                <Route path="dashboard" element={<AdminDashboard />} />
                <Route path = "add-product" element = {<AddProduct />} />
                <Route path = "add-category" element = {<AddCategory />} />
                <Route path = "orders" element = {<Orders />} />
                <Route path = "customers" element = {<Customers />} />
                <Route path = "reviews" element = {<Reviews />} />
                <Route path = "coupons" element = {<Coupons />} />
          </Route>


      </Routes>
   </Router>
  )
}

export default App