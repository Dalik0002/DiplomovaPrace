import './AddNewDrink.css'
import NewDrinkCom from '../components/NewDrinkCom'
import { useNavigate } from 'react-router-dom'

function AddNewDrink() {
  const navigate = useNavigate()

  return (
    <div className="centered-page">
      <button onClick={() => navigate('/')}>Zpět</button>
      <NewDrinkCom/>
    </div>
  )
}

export default AddNewDrink
