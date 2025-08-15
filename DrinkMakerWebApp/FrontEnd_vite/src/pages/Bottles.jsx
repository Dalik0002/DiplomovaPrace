import './Bottles.css'
import BottleSetUp from '../components/BottleSetUp'
import { useNavigate } from 'react-router-dom'
import '../components/Components.css'

function Bottles() {
  const navigate = useNavigate()

  return (
    <div className="centered-page">
      <button className="back-button" onClick={() => navigate('/')}>Zpět</button>
      <BottleSetUp/>
    </div>
  )
}

export default Bottles
