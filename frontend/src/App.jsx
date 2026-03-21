import React from 'react'
import { BrowserRouter as Router , Routes , Route , Navigate } from "react-router-dom";

import HomePage from "./pages/HomePage"
import LoginPage from "./pages/LoginPage"
import UserDashboard from "./pages/UserDashboard"
import ProtectedRoute from './components/auth/protectedRoute';

const App = () => {
  return (
   <Router>
      <Routes>"
          <Route path = "/" element = {<HomePage />} />
          <Route path = "/login" element = {<LoginPage />} />
          <Route path = "/dashboard" element = {<ProtectedRoute><UserDashboard /> </ProtectedRoute>} />
      </Routes>
   </Router>
  )
}

export default App