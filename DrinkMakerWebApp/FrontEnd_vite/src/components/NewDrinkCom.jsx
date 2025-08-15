import { useDrink } from '../state/DrinkContext'
import { useState, useEffect } from 'react'
import { addToQueue } from '../services/queueService'
import { getBottles } from '../services/bottleService'
import './Components.css'

function NewDrinkCom() {
  const [drinkName, setDrinkName] = useState("")
  const [glassIngredients, setGlassIngredients] = useState(Array(6).fill(""))
  const [volumes, setVolumes] = useState(Array(6).fill(0))
  const [availableIngredients, setAvailableIngredients] = useState([])
  const [status, setStatus] = useState("")

  useEffect(() => {
    getBottles()
      .then((backendData) => {
        const names = backendData
          .map(b => b.name || b.bottle)
          .filter(name => name && name.trim() !== "")
        setAvailableIngredients(names)
        setStatus('✅ Ingredience načteny')
      })
      .catch((err) => {
        console.error(err)
        setStatus('❌ Nepodařilo se načíst ingredience')
      })
  }, [])

  const handleSelect = (index, value) => {
    const updated = [...glassIngredients]
    updated[index] = value
    setGlassIngredients(updated)

    if (value && volumes[index] === 0) {
      const volCopy = [...volumes]
      volCopy[index] = 100
      setVolumes(volCopy)
    }
  }

  const handleVolumeChange = (index, value) => {
    const numeric = parseInt(value)
    const updated = [...volumes]
    updated[index] = isNaN(numeric) ? 0 : numeric
    setVolumes(updated)
  }

  const handleAdd = async () => {
    const hasAny = glassIngredients.some(g => g.trim() !== "")
    const hasName = drinkName.trim() !== ""

    if (!hasName) {
      setStatus("❌ Zadej název drinku")
      return
    }

    if (!hasAny) {
      setStatus("❌ Není vybrána žádná ingredience")
      return
    }

    const drink = {
      name: drinkName,
      ingredients: glassIngredients,
      volumes: volumes
    }

    try {
      await addToQueue(drink)
      setStatus(`✅ "${drinkName}" byl přidán do fronty`)
      setGlassIngredients(Array(6).fill(""))
      setVolumes(Array(6).fill(0))
      setDrinkName("")
    } catch (err) {
      console.error(err)
      setStatus("❌ Chyba při odesílání")
    }
  }

  return (
    <div className="centered-page">
      <h2>New Drink</h2>
      {status && <p>{status}</p>}
      <input
        type="text"
        placeholder="Název drinku"
        className="input-field"
        value={drinkName}
        onChange={e => setDrinkName(e.target.value)}
      />

      <div className="glass-grid">
        {glassIngredients.map((selected, idx) => (
          <div
            key={idx}
            className={`glass-item ${!selected ? 'empty' : ''}`}
          >
            <p>Ingredience {idx + 1}</p>
            <select
              value={selected}
              onChange={e => handleSelect(idx, e.target.value)}
              className="input-field"
            >
              <option value="">--Ingredience--</option>
              {availableIngredients.map((ing, i) => (
                <option key={i} value={ing}>{ing}</option>
              ))}
            </select>

            <input
              type="number"
              className="input-field"
              placeholder="Objem (ml)"
              min="0"
              max="250"
              value={volumes[idx]}
              onChange={e => handleVolumeChange(idx, e.target.value)}
              disabled={!selected}
            />
          </div>
        ))}
      </div>

      <button className="add-button" onClick={handleAdd}>
        ➕ Add Drink
      </button>
    </div>
  )
}

export default NewDrinkCom
