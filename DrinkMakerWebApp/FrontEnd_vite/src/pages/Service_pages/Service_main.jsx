// src/Service_main.jsx
import { Outlet, Link } from 'react-router-dom'
import '../../App.css'
import { useNavigate } from 'react-router-dom'

function Service_main() {
  const navigate = useNavigate()
  const isBaseRoute = location.pathname === '/service'

  return (
    <div className="centered-page">
      <button onClick={() => navigate('/')}>Zpět</button>
      <h1>Service</h1>
      {isBaseRoute && (
        <div className="nav-bar">
          <Link to="/service/uart">UART</Link>
        </div>
      )}

      <Outlet />
    </div>
  )
}

export default Service_main