import { useNavigate } from 'react-router-dom'
import { useState, useMemo } from 'react'
import './OrderReview.css'
import { useQueueList } from '../hooks/useQueueData';
import { startPouring } from '../services/general'

const POSITIONS = [1, 2, 3, 4, 5, 6]; // uprav dle reality

function OrderReview() {
  const navigate = useNavigate()

  const {
    data: queue = [],
    refresh: refreshQueueList,
  } = useQueueList();

  const [status, setStatus] = useState('');
  const [selectedIndex, setSelectedIndex] = useState('');
  const [selectedPos, setSelectedPos] = useState('')

  const disabled = queue.length === 0;

  const onChangeDrink = (e) => setSelectedIndex(e.target.value);
  const onChangePos   = (e) => setSelectedPos(e.target.value);

  const handleStart = async () => {
    if (!selectedOrder) {
      setStatus('❌ Vyber drink');
      return;
    }
    if (selectedPos === '') {
      setStatus('❌ Vyber pozici sklenice');
      return;
    }
    try {
      setStatus('⏳ Spouštím nalévání…');
      await startPouring(selectedOrder.name, (Number(selectedPos)-1));
      setStatus('✅ Nalévání spuštěno');
      refreshQueueList();
    } catch (err) {
      console.error('Chyba při startu nalévání:', err);
      setStatus('❌ Chyba při startu nalévání');
    }
  };


  // vybraná položka (nepovinné, když chceš s ní dál pracovat)
  const selectedOrder = useMemo(
    () => (selectedIndex !== '' ? queue[Number(selectedIndex)] : null),
    [selectedIndex, queue]
  );

  return (
    <div className="pages-centered-page">
      <button className="back-button" onClick={() => navigate('/')}>Zpět</button>
      <h1>Výběr Nápoje</h1>
      <p>Vyberte jeden z dostupných nápojů.</p>
      {status && <p>{status}</p>}

      <select
        value={selectedIndex}
        onChange={onChangeDrink}
        className="input-field"
        disabled={disabled}
      >
        <option value="">--Název drinku--</option>
        {queue.map((order, i) => (
          <option key={`${order.name}-${i}`} value={i}>
            {order.name || `Drink ${i + 1}`}
          </option>
        ))}
      </select>

      {selectedOrder && (
        <>
        <div className="drink-preview">
          <h3>Vybráno: {selectedOrder.name}</h3>
          <ul>
            {selectedOrder.ingredients.map((ing, idx) => {
              const vol = selectedOrder.volumes?.[idx] ?? 0;
              if (!ing?.trim() || vol <= 0) return null;
              return <li key={idx}>{ing}: {vol} ml</li>;
            })}
          </ul>
        </div>

        <div className="drink-preview">
          <select
            value={selectedPos}
            onChange={onChangePos}
            className="input-field"
          >
            <option value="">--Pozice sklenice--</option>
            {POSITIONS.map(p => (
              <option key={p} value={p}>Pozice {p}</option>
            ))}
          </select>

          <button 
          className="start-button" 
          onClick={handleStart} 
          disabled={!selectedOrder || selectedPos === ''}
          >
            ZAČÍT NALÉVAT</button>
        </div>
        </>
      )}
    </div>
  )
}

export default OrderReview
