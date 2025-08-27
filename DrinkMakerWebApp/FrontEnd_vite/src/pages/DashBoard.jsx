import { useNavigate } from 'react-router-dom'
import { useEffect, useState } from 'react'
import StateConteiner from '../components/StateConteiner'
import QueueListConteiner from '../components/QueueListConteiner'
import { getState } from '../services/stateService'
import './Dashboard.css'

function Dashboard() {
  const navigate = useNavigate()

  const [state, setState] = useState(false)

  useEffect(() => {
    const fetchState = async () => {
      try {
        const result = await getState()
        setState(result)
      } catch (err) {
        console.error("Chyba při načítání stavu:", err)
        setError("Chyba při načítání stavu")
      } finally {
        setLoading(false)
      }
    }
    fetchState()
  }, [])

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
            <button
              className="start-button"
              disabled={state > 0}
              onClick={() => navigate('/newDrink')}
            >
              ZAHÁJIT NALÉVÁNÍ 
            </button>
            <button
              className="addtoqueue-button"onClick={() => navigate('/newDrink')}> PŘIDAT NOVÝ DRINK 
            </button>
          </div>
        </div>
        
        {/* Pravý sloupec */}
        <div className="right-column">
          <QueueListConteiner />
        </div>
      </div>

      <div className="footer">
        <h2>DrinkMaker © 2025</h2>
      </div>
    </div>
  )
}

export default Dashboard
