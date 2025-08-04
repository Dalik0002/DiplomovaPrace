import { Routes, Route, Link, useLocation, useNavigate } from 'react-router-dom'
import OrderScreen from './Order_pages/OrderScreen'
import Service_main from './Service_pages/Service_main'
import Ingredient from './Service_pages/Ingredient'
import UART_Test from './Service_pages/UART_Test'
import '../App.css'

function StartMenu() {
  const location = useLocation()
  const navigate = useNavigate()

  const showBack = location.pathname !== '/'

  return (
    <div className="app-container">
      {showBack && (
        <button className="back-button" onClick={() => {
          if (window.history.length > 2) {
            navigate(-1)
          } else {
            navigate('/')
          }
        }}>
          ← Back
        </button>
      )}

      <Routes>
        <Route path="/order" element={<OrderScreen />} />

        <Route path="/service/*" element={<Service_main />}>
          <Route path="ingredient" element={<Ingredient />} />
          <Route path="uart" element={<UART_Test />} />
        </Route>

        <Route path="/" element={
          <div className="nav-bar">
            <Link to="/order">Order</Link>
            <Link to="/service">Service</Link>
          </div>
        } />
      </Routes>
    </div>
  )
}

export default StartMenu
