import { Routes, Route, Link } from 'react-router-dom'
import OrderScreen from './Order_pages/OrderScreen'
import Service_main from './Service_pages/Service_main'
import Ingredient from './Service_pages/Ingredient'
import UART_Test from './Service_pages/UART_Test'
import BackButton from '../components/BackButton'  // ← sem importuješ komponentu
import '../App.css'

function StartMenu() {
  return (
    <div className="app-container">
      <Routes>
        <Route
          path="/order"
          element={
            <>
              <BackButton />
              <OrderScreen />
            </>
          }
        />

        <Route
          path="/service/*"
          element={
            <>
              <BackButton />
              <Service_main />
            </>
          }
        >
          <Route path="ingredient" element={<Ingredient />} />
          <Route path="uart" element={<UART_Test />} />
        </Route>

        <Route
          path="/"
          element={
            <div className="nav-bar">
              <Link to="/order">Order</Link>
              <Link to="/service">Service</Link>
            </div>
          }
        />
      </Routes>
    </div>
  )
}

export default StartMenu
