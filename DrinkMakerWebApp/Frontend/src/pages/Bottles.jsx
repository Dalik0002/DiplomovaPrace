import BottleSetUp from '../components/BottleSetUp'
import { useNavigate } from 'react-router-dom'

function Bottles() {
  const navigate = useNavigate()

  return (
    <div className="pages-centered-page">
      <div className="centered-frame">
        <button className="back-button" onClick={() => navigate('/')}>Zpět</button>
        <BottleSetUp/>
      </div>  
    </div>
  )
}

export default Bottles
