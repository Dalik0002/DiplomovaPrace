import './Components.css'

function QueueList({ queue }) {

  const deleteItem = async (index) => {
    try {
      await deleteItemFromQueue(index)
      refreshQueue()
    } catch (err) {
      console.error("Chyba při mazání fronty:", err)
    }
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
              <button className="delete-button" onClick={() => deleteItem(i)}>
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