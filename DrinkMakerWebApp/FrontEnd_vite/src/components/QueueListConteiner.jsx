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
      <h2 className="queue-title">Fronta drinků</h2>

      <div className="queue-list">
        {isLoading ? (
          <p>Načítám…</p>
        ) : queueError ? (
          <p className="queue-empty">Nepodařilo se načíst frontu.</p>
        ) : isEmpty ? (
          <p className="queue-empty">Žádný drink ve frontě</p>
        ) : (
          <ul>
            {queue.map((item, index) => {
              const name = typeof item === 'string' ? item : (item?.name ?? `Drink ${index + 1}`)
              return <li key={index}>{index + 1}. {name}</li>
            })}
          </ul>
        )}
      </div>

      <div className="queue-info">
        ⏱ Fronta: {queueCount} objednávky
      </div>

      <button className="action-button" onClick={() => navigate('/editQueue')}>
        Upravit frontu
      </button>
    </div>
  )
}

export default QueueListConteiner
