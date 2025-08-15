import './Bottles.css'
import BottleSetUp from '../components/BottleSetUp'
import { useNavigate } from 'react-router-dom'

function Bottles() {
  const navigate = useNavigate()

  return (
    <div className="centered-page">
      <button onClick={() => navigate('/')}>Zpět</button>
      <BottleSetUp/>
    </div>
  )
}

export default Bottles
