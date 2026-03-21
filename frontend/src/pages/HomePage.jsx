import React from 'react'
import { useNavigate } from 'react-router-dom'

const HomePage = () => {
  const navigate = useNavigate();

  return (
    <div>
      HomePage <br /> <br />

      <button onClick={() => navigate("/login")}>Login</button>

    </div>
  )
}

export default HomePage