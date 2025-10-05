import { Routes, Route } from 'react-router-dom'
import Dashboard from './pages/DashBoard'
import ServiceMain from './pages/ServicePages/ServiceMain'
import AddNewDrink from './pages/AddNewDrink'
import Glasses from './pages/Glasses'
import Bottles from './pages/Bottles'
import UARTTest from './pages/ServicePages/UARTTest'
import OrderReview from './pages/OrderReview'

function AppRouter() {
  return (
    <Routes>
      <Route path="/" element={<Dashboard />} />
      <Route path="/service" element={<ServiceMain />}>
        <Route path="uart" element={<UARTTest />} />
        <Route path="clean" element={<UARTTest />} />
        <Route path="reset" element={<UARTTest />} />
      </Route>
      <Route path="/bottles" element={<Bottles/>}></Route>
      <Route path="/editGlasses" element={<Glasses/>}></Route>
      <Route path="/newDrink" element={<AddNewDrink />}></Route>
      <Route path="/orderReview" element={<OrderReview />}></Route>
    </Routes>
  )
}

export default AppRouter
