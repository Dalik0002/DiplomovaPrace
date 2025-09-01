import { Routes, Route } from 'react-router-dom'
import Dashboard from './pages/DashBoard'
import Service_main from './pages/Service_pages/Service_main'
import AddNewDrink from './pages/AddNewDrink'
import DrinksQueue from './pages/DrinksQueue'
import Bottles from './pages/Bottles'
import UART_Test from './pages/Service_pages/UART_Test'
import OrderReview from './pages/OrderReview'

function AppRouter() {
  return (
    <Routes>
      <Route path="/" element={<Dashboard />} />
      <Route path="/service" element={<Service_main />}>
        <Route path="uart" element={<UART_Test />} />
        <Route path="clean" element={<UART_Test />} />
        <Route path="reset" element={<UART_Test />} />
      </Route>
      <Route path="/bottles" element={<Bottles/>}></Route>
      <Route path="/editQueue" element={<DrinksQueue/>}></Route>
      <Route path="/newDrink" element={<AddNewDrink />}></Route>
      <Route path="/orderReview" element={<OrderReview />}></Route>
    </Routes>
  )
}

export default AppRouter
