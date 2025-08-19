import { useNavigate } from 'react-router-dom'
import StateConteiner from '../components/StateConteiner'
import QueueListConteiner from '../components/QueueListConteiner'
import './Dashboard.css'

function Dashboard() {
  const navigate = useNavigate()

  return (
    <div className="dashboard-container">
      <div className="top-bar">
        <h1 className="title">DrinkMaker</h1>
        <div className="nav-buttons">
          <button onClick={() => navigate('/bottles')}>📦 Setup</button>
          <button onClick={() => navigate('/service')}>⚙️ Service</button>
        </div>
      </div>

      <div className="core-container">
        {/* Levý sloupec*/}
        <div className="left-column">
          <StateConteiner />
          <div className="control-container">
            <h2 className="control-title">Začít nalévat</h2>
          </div>
        </div>
        
        {/* Pravý sloupec */}
        <div className="right-column">
          <QueueListConteiner />
        </div>
      </div>

      <div className="footer">
        <button
          className="add-button"onClick={() => navigate('/newDrink')}> PŘIDAT NOVÝ DRINK </button>
      </div>
    </div>
  )
}

export default Dashboard
