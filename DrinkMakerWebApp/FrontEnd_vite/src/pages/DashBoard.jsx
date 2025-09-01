import { useNavigate } from 'react-router-dom'
import { useEffect, useState } from 'react'
import StateConteiner from '../components/StateConteiner'
import QueueListConteiner from '../components/QueueListConteiner'
import { getState, setService } from '../services/stateService'
import { getServiceStatus, acquireService } from '../services/serviceLockService'

import './DashBoard.css'

function Dashboard() {
  const navigate = useNavigate()

  const [state, setState] = useState(false)
  const [loading, setLoading] = useState(true)
  const [serviceBusy, setServiceBusy] = useState(false)
  
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

  useEffect(() => {
    getServiceStatus().then(s => setServiceBusy(s.locked)).catch(() => {})
  }, [])

  const sendService = async () => {
    try {
      await acquireService()
      navigate('/service')   // máme lock
    } catch (err) {
      setServiceBusy(true)
      alert('Service je právě obsazený. Zkuste to později.')
    }
  }

  return (
    <div className="dashboard-container">
      <div className="top-bar">
        <h1 className="title">DrinkMaker</h1>
        <div className="nav-buttons">
          <button onClick={() => navigate('/bottles')}>📦 Setup</button>
          <button onClick={sendService} disabled={serviceBusy}>
            {serviceBusy ? '⚙️ Service (obsazeno)' : '⚙️ Service'}
          </button>
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
              onClick={() => navigate('/orderReview')}
            >
              ZAHÁJIT NALÉVÁNÍ 
            </button>
            <button
              className="add-button"onClick={() => navigate('/newDrink')}> PŘIDAT NOVÝ DRINK 
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
