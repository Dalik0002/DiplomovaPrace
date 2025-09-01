
import { useNavigate } from 'react-router-dom'
import { useEffect, useState } from 'react'
import { getQueueList } from '../services/queueService'
import './OrderReview.css'

function OrderReview() {
  const navigate = useNavigate()
  const [queue, setQueue] = useState([])
  const [disabled, setDisabled] = useState(false)


  useEffect(() => {
    getQueueList()
      .then(setQueue)
      .catch((err) => console.error("Chyba při načítání fronty:", err))
  }, [])

  const onChange = () => {
    // TODO
  }
  

  return (
    <div className="pages-centered-page">
      <button className="back-button" onClick={() => navigate('/')}>Zpět</button>
      <h1>Revize objednávky</h1>
      <p>Prosím zkontrolujte svou objednávku před odesláním do fronty.</p>
      <select
        value={queue.name}
        onChange={onChange()}
        className="input-field"
        disabled={disabled}
      >
        <option value="">--Název drinku--</option>
      </select>

    </div>
  )
}

export default OrderReview
