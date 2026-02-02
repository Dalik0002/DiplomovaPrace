import { Routes, Route } from 'react-router-dom'
import Dashboard from './pages/DashBoard'
import ServiceMain from './pages/ServicePages/ServiceMain'
import AddNewDrink from './pages/AddNewDrink'
import Glasses from './pages/Glasses'
import Bottles from './pages/Bottles'
import ServiceRemote from './pages/ServicePages/ServiceRemote'
import OrderReview from './pages/OrderReview'
import ServiceStations from './pages/ServicePages/ServiceStations'
import Pouring from "./pages/Pouring";

function AppRouter() {
  return (
    <Routes>
      <Route path="/" element={<Dashboard />} />
      <Route path="/service" element={<ServiceMain />}>
        <Route path="serviceRemote" element={<ServiceRemote />}/>
        <Route path="serviceStations" element={<ServiceStations />}/>
      </Route>
      <Route path="/bottles" element={<Bottles/>}></Route>
      <Route path="/editGlasses" element={<Glasses/>}></Route>
      <Route path="/newDrink" element={<AddNewDrink />}></Route>
      <Route path="/orderReview" element={<OrderReview />}></Route>
      <Route path="/pouring" element={<Pouring />}></Route>
    </Routes>
  )
}

export default AppRouter
