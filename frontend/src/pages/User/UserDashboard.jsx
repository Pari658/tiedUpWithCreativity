import React from 'react'
import { useNavigate , Outlet } from 'react-router-dom'


const UserDashboard = () => {           
  const navigate = useNavigate();
  return (
    <div>
      UserDashboard
      <br /><br />
      <button onClick={() => {navigate('cart')}}>cart</button> <br /><br />
      <button onClick={() => {navigate('profile')}}>profile</button>

      <Outlet />
    </div>
  )
}

export default UserDashboard