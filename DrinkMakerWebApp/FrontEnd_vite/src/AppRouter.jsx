import { Routes, Route } from 'react-router-dom'
import Dashboard from './pages/DashBoard'
import Order_main from './pages/Order_pages/OrderScreen'
import Service_main from './pages/Service_pages/Service_main'
import NewDrink from './components/NewDrink'
import DrinksQueue from './pages/Order_pages/DrinksQueue'
import Ingredient from './pages/Service_pages/Ingredient'
import UART_Test from './pages/Service_pages/UART_Test'

function AppRouter() {
  return (
    <Routes>
      <Route path="/" element={<Dashboard />} />
      <Route path="/order" element={<Order_main />}>
        <Route path="newDrink" element={<NewDrink />} />
        <Route path="drinksQueue" element={<DrinksQueue />} />
      </Route>
      <Route path="/service" element={<Service_main />}>
        <Route path="ingredient" element={<Ingredient />} />
        <Route path="uart" element={<UART_Test />} />
      </Route>
    </Routes>
  )
}

export default AppRouter
