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

  const glasses = [
    { name: 'Rum + Cola' },
    { name: 'Gin + Tonic' },
    { name: '' },
    { name: 'Jack + Cola' },
    { name: '' },
    { name: 'Vodka' },
  ]

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
          <button onClick={() => navigate('/order')}>📦 Setup</button>
          <button onClick={() => navigate('/service')}>⚙️ Nastavení</button>
        </div>
      </div>

      <div className="core-container">
        {/* Levý sloupec - sklenice */}
        <div className="glass-grid">
          {glasses.map((g, i) => (
            <div key={i} className="glass-box">
              <div className="glass-emoji">🍹 Sklenice {i + 1}</div>
              <div className="glass-content">[{g.name || 'Nezadáno'}]</div>
            </div>
          ))}
        </div>


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
