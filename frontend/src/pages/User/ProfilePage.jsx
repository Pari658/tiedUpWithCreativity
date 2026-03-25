import React from 'react'
import { useNavigate } from 'react-router-dom'


const ProfilePage = () => {
  const navigate = useNavigate();
  return (
    <div>
      ProfilePage
      <br /><br />
      <button onClick={() => {navigate('orders')}}>Your Orders</button>
    </div>
  )
}

export default ProfilePage