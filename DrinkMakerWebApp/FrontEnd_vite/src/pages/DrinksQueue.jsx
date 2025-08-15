import './DrinkQueue.css'
import { useEffect, useState } from 'react'
import QueueList from '../components/QueueList'
import { getQueueList, deleteQueue } from '../services/queueService'
import { useNavigate } from 'react-router-dom'

function DrinksQueue() {
  const [queue, setQueue] = useState([])
  const navigate = useNavigate()

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
      <button onClick={() => navigate('/')}>Zpět</button>
      <h1>QUEUE</h1>
      <QueueList queue={queue} />
      <button className="delete-button" onClick={clearQueue}>
        Vymazat celou frontu
      </button>
    </div>
  )
}

export default DrinksQueue
