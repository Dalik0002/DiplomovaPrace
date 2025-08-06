import { useEffect, useState } from 'react'
import { useDrink } from '../../state/DrinkContext'
import { assignBottles, getBottles } from '../../services/bottleService'
import './Service.css'

function Ingredient() {
  const { bottles, setBottles } = useDrink()
  const [status, setStatus] = useState('')

  useEffect(() => {
    getBottles()
      .then((backendData) => {
        const updated = Array(6).fill().map((_, i) => {
          const match = backendData.find(b => b.position === i)
          return match ? { position: i, bottle: match.bottle } : { position: i, bottle: '' }
        })
        setBottles(updated)
        setStatus('✅ Načtena uložená konfigurace')
      })
      .catch((err) => {
        console.error(err)
        setStatus('❌ Nepodařilo se načíst konfiguraci')
      })
  }, [])

  const handleChange = (position, newName) => {
    const updated = bottles.map(b =>
      b.position === position ? { ...b, bottle: newName } : b
    )
    setBottles(updated)
  }

  const handleAssign = async () => {
    try {
      await assignBottles(bottles)
      setStatus('✅ Konfigurace uložena')
    } catch (err) {
      console.error(err)
      setStatus('❌ Chyba při ukládání konfigurace')
    }
  }

  return (
    <div className="centered-page">
      <h2>Setup – Konfigurace lahví</h2>

      <div className="bottle-list">
        {bottles.map(({ position, bottle }) => (
          <div key={position} className="bottle-row">
            <label className="bottle-pos">Pozice {position + 1}:</label>
            <input
              type="text"
              value={bottle}
              onChange={(e) => handleChange(position, e.target.value)}
              className="input-field"
              placeholder="Název ingredience"
            />
          </div>
        ))}
      </div>

      <div className="button-row">
        <button onClick={handleAssign} className="action-button">💾 Uložit konfiguraci</button>
      </div>

      {status && <p>{status}</p>}
    </div>
  )
}

export default Ingredient
