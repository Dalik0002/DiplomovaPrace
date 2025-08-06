// src/Service_main.jsx
import { Outlet, Link, useLocation } from 'react-router-dom'
import '../../App.css'

function Service_main() {
  const location = useLocation()
  const isBaseRoute = location.pathname === '/service'

  return (
    <div className="centered-page">
      <h1>Service</h1>
      {isBaseRoute && (
        <div className="nav-bar">
          <Link to="/service/ingredient">Ingredient</Link>
          <Link to="/service/uart">UART</Link>
        </div>
      )}

      <Outlet />
    </div>
  )
}

export default Service_main