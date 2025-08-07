import { Routes, Route, Link } from 'react-router-dom'
import Order_main from './Order_pages/OrderScreen'
import NewDrink from '../components/NewDrink'
import DrinksQueue from './Order_pages/DrinksQueue'

import Service_main from './Service_pages/Service_main'
import Ingredient from './Service_pages/Ingredient'
import UART_Test from './Service_pages/UART_Test'
import BackButton from '../components/BackButton'
import '../App.css'

function StartMenu() {
  return (
    <div className="app-maincontainer">
      <div className="app-header">
        <h1>Drink Maker</h1>
        <h2>PANORAMIX</h2>
        <h3>• Průmyslový • Automatický • Nápojový • Odborník • Receptur • Alkoholických • MIXů •</h3>
      </div>
      <Routes>
        <Route
          path="/order/*"
          element={
            <>
              <BackButton />
              <Order_main />
            </>
          }
        >
          <Route path="drinksQueue" element={<DrinksQueue />} />
          <Route path="newDrink" element={<NewDrink />} />
        </Route>

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
