import NewDrinkCom from '../components/NewDrinkCom'
import { useNavigate } from 'react-router-dom'
import './AddNewDrink.css'

function AddNewDrink() {
  const navigate = useNavigate()

  return (
    <div className="pages-centered-page">
      <button className="back-button" onClick={() => navigate('/')}>Zpět</button>
      <NewDrinkCom/>
    </div>
  )
}

export default AddNewDrink
