import NewDrinkCom from '../components/NewDrinkCom'
import { useNavigate } from 'react-router-dom'

function AddNewDrink() {
  const navigate = useNavigate()

  return (
    <div className="pages-centered-page">
      <div className="centered-frame">
        <button className="back-button" onClick={() => navigate('/')}>Zpět</button>
        <NewDrinkCom/>
      </div>
    </div>
  )
}

export default AddNewDrink
