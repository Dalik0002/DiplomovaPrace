import './OrderScreens.css'
import { useEffect, useState } from 'react'
import QueueList from '../../components/QueueList'
import { getQueueList, deleteQueue } from '../../services/queueService'

function DrinksQueue() {
  const [queue, setQueue] = useState([])

  const refreshQueue = () => {
    getQueueList()
      .then(setQueue)
      .catch((err) => console.error("Chyba při načítání fronty:", err))
  }

  useEffect(() => {
    refreshQueue()
  }, [])

  const clearQueue = async () => {
    try {
      await deleteQueue()
      refreshQueue() // ⬅️ opětovné načtení
    } catch (err) {
      console.error("Chyba při mazání fronty:", err)
    }
  }

  return (
    <div className="centered-page">
      <h1>QUEUE</h1>
      <QueueList queue={queue} />
      <button className="delete-button" onClick={clearQueue}>
        Vymazat celou frontu
      </button>
    </div>
  )
}

export default DrinksQueue
