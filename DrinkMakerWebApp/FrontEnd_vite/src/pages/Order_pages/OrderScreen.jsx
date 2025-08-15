
import { Outlet, Link, useLocation } from 'react-router-dom'
import './OrderScreens.css'

function Order_main() {
  const location = useLocation()
  const isBaseRoute = location.pathname === '/order'

  return (
    <div className="centered-page">
      {isBaseRoute && (
        <>
          <div className="nav-bar">
            <Link to="/order/newDrink">Add new Drink</Link>
          </div>
        </>
      )}

      <Outlet />
    </div>
  )
}

export default Order_main