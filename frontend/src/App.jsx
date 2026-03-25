import React from 'react'
import { BrowserRouter as Router , Routes , Route , Navigate } from "react-router-dom";

import HomePage from "./pages/HomePage"
import LoginPage from "./pages/LoginPage"
import ProtectedRoute from './components/auth/protectedRoute';

import Applayout from './components/layout/AppLayout';

//admin import
import AdminDashboard from './pages/Admin/AdminDashboard';
import AddCategory from './pages/Admin/AddCategory';
import AddProduct from './pages/Admin/AddProduct';
import Coupons from './pages/Admin/coupons';
import Customers from './pages/Admin/customers';
import Orders from './pages/Admin/orders';
import Reviews from './pages/Admin/reviews';


// user import
import UserDashboard from "./pages/User/UserDashboard"
import CartPage from "./pages/User/CartPage"
import ProfilePage from './pages/User/ProfilePage';
import YourOrders from './pages/User/YourOrders';


const App = () => {
  return (
   <Router>
      <Routes>
          <Route path = "/" element = {<HomePage />} />
          <Route path = "/login" element = {<LoginPage />} />

          <Route path = "/admin" element = {<Applayout />} >
                <Route path = "dashboard" element={<AdminDashboard />} />
                <Route path = "add-product" element = {<AddProduct />} />
                <Route path = "add-category" element = {<AddCategory />} />
                <Route path = "orders" element = {<Orders />} />
                <Route path = "customers" element = {<Customers />} />
                <Route path = "reviews" element = {<Reviews />} />
                <Route path = "coupons" element = {<Coupons />} />
          </Route>

          <Route path = "/dashboard" element = {<ProtectedRoute><UserDashboard /></ProtectedRoute>}>
					<Route path = "cart" element = {<CartPage />} />
					<Route path = "profile" element = {<ProfilePage />} />
					<Route path = "profile/orders" element = {<YourOrders />} />
          </Route>


      </Routes>
   </Router>
  )
}

export default App