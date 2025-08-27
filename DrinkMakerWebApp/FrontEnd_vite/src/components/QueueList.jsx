import './Components.css'
import { deleteItemFromQueue, getQueueList} from '../services/queueService'
import { useEffect, useState } from 'react'


function QueueList() {
  const [queue, setQueue] = useState([])

  useEffect(() => {
    refreshQueue()
  }, [])

  const deleteItem = async (name) => {
    try {
      await deleteItemFromQueue(name)
      refreshQueue()
    } catch (err) {
      console.error("Chyba při mazání fronty:", err)
    }
  }

  const refreshQueue = () => {
    getQueueList()
      .then(setQueue)
      .catch((err) => console.error("Chyba při načítání fronty:", err))
  }

  return (
    <>
      {queue.length === 0 ? (
        <p>Fronta je prázdná</p>
      ) : (
        <ul className="queue-list">
          {queue.map((order, i) => (
            <li key={i} className="drink-item">
              <strong>{i + 1}.</strong> {order.name || `Drink ${i + 1}`}
              <button className="delete-button" onClick={() => deleteItem(order.name)}>
                Smazat
              </button>
            </li>
           
          ))}
        </ul>
      )}
    </>
  )
}

export default QueueList