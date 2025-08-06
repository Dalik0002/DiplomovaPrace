// src/components/QueueList.jsx

import { useEffect, useState } from 'react'
import { getQueueList} from '../services/queueService'

function QueueList({ queue }) {
  return (
    <>
      {queue.length === 0 ? (
        <p>No drink in queue</p>
      ) : (
        <ul className="queue-list">
          {queue.map((order, i) => (
            <li key={i} className="drink-item">
              <strong>{i + 1}.</strong> {order.name || `Drink ${i + 1}`}
            </li>
          ))}
        </ul>
      )}
    </>
  )
}

export default QueueList