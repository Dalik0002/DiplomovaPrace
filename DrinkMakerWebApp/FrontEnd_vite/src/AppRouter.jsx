import { Routes, Route } from 'react-router-dom'
import Dashboard from './pages/DashBoard'
import Order_main from './pages/Order_pages/OrderScreen'
import Service_main from './pages/Service_pages/Service_main'
import AddNewDrink from './pages/AddNewDrink'
import DrinksQueue from './pages/DrinksQueue'
import Bottles from './pages/Bottles'
import UART_Test from './pages/Service_pages/UART_Test'

function AppRouter() {
  return (
    <Routes>
      <Route path="/" element={<Dashboard />} />
      <Route path="/order" element={<Order_main />}>
        <Route path="newDrink" element={<AddNewDrink />} />
      </Route>
      <Route path="/service" element={<Service_main />}>
        <Route path="uart" element={<UART_Test />} />
      </Route>
      <Route path="/bottles" element={<Bottles/>}></Route>
      <Route path="/editQueue" element={<DrinksQueue/>}></Route>
      <Route path="/newDrink" element={<AddNewDrink />}></Route>
    </Routes>
  )
}

export default AppRouter
