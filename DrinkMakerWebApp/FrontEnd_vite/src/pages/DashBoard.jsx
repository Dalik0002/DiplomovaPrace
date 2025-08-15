import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { getNumberOfDrinks } from '../services/queueService'
import { getQueueList } from '../services/queueService'
import './Dashboard.css'

function Dashboard() {
  const navigate = useNavigate()
  const [queueCount, setQueueCount] = useState(0)

  const [queue, setQueue] = useState([])
  
  const refreshQueue = () => {
    getQueueList()
      .then(setQueue)
      .catch((err) => console.error("Chyba při načítání fronty:", err))
  }

  useEffect(() => {
    refreshQueue()
  }, [])

  useEffect(() => {
    const fetchQueueCount = async () => {
      try {
        const result = await getNumberOfDrinks()
        setQueueCount(result.count || 0)
      } catch (err) {
        console.error("Chyba při získávání počtu drinků:", err)
      }
    }

    fetchQueueCount()
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
          <div className="state-container">
            <h2 className="state-title">Stav</h2>
          </div>
          <div className="control-container">
            <h2 className="control-title">Začít nalévat</h2>
          </div>
        </div>
        
        {/* Pravý sloupec */}
        <div className="right-column">
          <div className="queue-container">
            <h2 className="queue-title">Fronta Drinků</h2>

            <div className="queue-list">
              {queue.length === 0 ? (
                <p className="queue-empty">Žádný drink ve frontě</p>
              ) : (
                <ul>
                  {queue.map((drink, index) => (
                    <li key={index}>
                      {index + 1}. {drink}
                    </li>
                  ))}
                </ul>
              )}
            </div>
            <div className="queue-info">
              ⏱ Fronta: {queueCount} objednávky
            </div>
            <button onClick={() => navigate('/editQueue')}>Upravit frontu</button>
          </div>
        </div>
      </div>

      <div className="footer">
        <button
          className="add-button"onClick={() => navigate('/order/newDrink')}> PŘIDAT NOVÝ DRINK </button>
      </div>
    </div>
  )
}

export default Dashboard
