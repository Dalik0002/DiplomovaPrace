
import { useNavigate } from 'react-router-dom'
import { useEffect, useState } from 'react'
import './OrderReview.css'

import { useQueueList} from '../hooks/useQueueData';


function OrderReview() {
  const navigate = useNavigate()
  const [disabled, setDisabled] = useState(false)

  const {
    data: queue,
    refresh: refreshQueueList,
  } = useQueueList();


  const onChange = () => {
    // TODO
  }

  return (
    <div className="pages-centered-page">
      <button className="back-button" onClick={() => navigate('/')}>Zpět</button>
      <h1>Výběr Nápoje</h1>
      <p>Vyberte jeden z dostupných nápojů.</p>
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
