
import { Outlet, Link, useLocation } from 'react-router-dom'
import '../../App.css'
import './OrderScreens.css'

function Order_main() {
  const location = useLocation()
  const isBaseRoute = location.pathname === '/order'

  return (
    <div className="centered-page">
      <h1>DrinkMaker</h1>
      {isBaseRoute && (
        <>
          <div className="nav-bar">
            <Link to="/order/drinksQueue">Edit drink Queue</Link>
            <Link to="/order/newDrink">Add new Drink</Link>
          </div>
        </>
      )}

      <Outlet />
    </div>
  )
}

export default Order_main