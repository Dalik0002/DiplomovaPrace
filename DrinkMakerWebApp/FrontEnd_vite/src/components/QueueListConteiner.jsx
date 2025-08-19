import { useNavigate } from 'react-router-dom'
import { useEffect, useState } from 'react'
import { getNumberOfDrinks, getQueueListof4 } from '../services/queueService'
import { getQueueList } from '../services/queueService'
import './QueueListConteiner.css'

function QueueListConteiner() {
  const navigate = useNavigate()
  const [queueCount, setQueueCount] = useState(0)

  const [queue, setQueue] = useState([])    
  
  const refreshQueue = () => {
    getQueueListof4()
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
    <div className="queue-container">
      <h2 className="queue-title">Fronta drinků</h2>

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
  )
}

export default QueueListConteiner
