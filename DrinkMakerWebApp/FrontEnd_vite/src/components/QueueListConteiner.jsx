import { useNavigate } from 'react-router-dom'
import './QueueListConteiner.css'
import { useNumberOfDrinks, useQueueList } from '../hooks/useQueueData'

function QueueListConteiner() {
  const navigate = useNavigate()

  const {
    data: queue = [],
    isLoading: queueLoading,
    error: queueError,
  } = useQueueList()

  const {
    drinkCount: queueCount = 0,
    isLoading: countLoading,
  } = useNumberOfDrinks()

  const isLoading = queueLoading || countLoading
  const isEmpty = (queue?.length ?? 0) === 0

  return (
    <div className="queue-container">
      <h2 className="queue-title">Sklenice</h2>

      <div className="queue-list">
        {isLoading ? (
          <p>Načítám…</p>
        ) : queueError ? (
          <p className="queue-empty">Nepodařilo se načíst sklenice</p>
        ) : isEmpty ? (
          <p className="queue-empty">Žádná sklenice navolena</p>
        ) : (
          <ul>
            {queue.map((item, index) => {
              const name = typeof item === 'string' ? item : (item?.name ?? `Drink ${index + 1}`)
              return <li key={index}><strong>Sklenice {index + 1}:</strong> {name}</li>
            })}
          </ul>
        )}
      </div>

      <div className="queue-info">
        Obsazeno: {queueCount}/6 sklenic
      </div>

      <button className="action-button" onClick={() => navigate('/editQueue')}>
        Upravit sklenice
      </button>
    </div>
  )
}

export default QueueListConteiner
