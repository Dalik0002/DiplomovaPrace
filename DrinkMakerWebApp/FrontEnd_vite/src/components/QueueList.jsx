import { deleteItemFromQueue } from '../services/queueService'
import { useEffect, useState } from 'react'

import { useQueueList } from '../hooks/useQueueData';

function QueueList() {

  const {
    data: queue,
    isLoading,
    error,
    refresh,
  } = useQueueList();

  const deleteItem = async (name) => {
    try {
      await deleteItemFromQueue(name)
      refresh()
    } catch (err) {
      console.error("Chyba při mazání fronty:", err)
    }
  }

  if (isLoading) return <p>Načítání…</p>;
  if (error) return <p className='error-message'>Chyba při načítání sklenic.</p>;

  return (
    <>
      {queue.length === 0 ? (
        <p>Žádná sklenice</p>
      ) : (
        <div className="queue-list">
          {queue.map((order, i) => (
            <li key={i} className="drink-item">
              <strong>Sklenice {i + 1}:</strong> {order.name || `Drink ${i + 1}`}
              <button className="delete-button" onClick={() => deleteItem(order.name)}>
                Smazat
              </button>
            </li>
           
          ))}
        </div>
      )}
    </>
  )
}

export default QueueList