import { useEffect, useState } from 'react'
import QueueList from '../components/QueueList'
import { deleteQueue } from '../services/queueService'
import { useNavigate } from 'react-router-dom'
import './DrinkQueue.css'

function DrinksQueue() {
  const navigate = useNavigate()

  const clearQueue = async () => {
    try {
      await deleteQueue()
    } catch (err) {
      console.error("Chyba při mazání fronty:", err)
    }
  }

  return (
    <div className="centered-page">
      <button className="back-button" onClick={() => navigate('/')}>Zpět</button>
      <h1>Sklenice</h1>
      <QueueList />
      <button className="delete-button" onClick={clearQueue}>
        Vymazat všechny sklenice
      </button>
    </div>
  )
}

export default DrinksQueue
