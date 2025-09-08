import { useState, useEffect } from 'react'
import { addGlass } from '../services/glassesService'
import IngredientCard from './IngredientCard'

import { useBottles } from '../hooks/useBottleData'
import { useGlasses, useFreePosition } from '../hooks/useGlassesData'


function NewDrinkCom() {
  const [drinkName, setDrinkName] = useState('')
  const [items, setItems] = useState([
    { ingredient: '', volume: 0 },
    { ingredient: '', volume: 0 },
  ])
  const [status, setStatus] = useState('')
  const [saving, setSaving] = useState(false)

  // --- data z hooků
  const {
    isLoading,
    error,
    availableIngredients,
    isNoIngradience,
  } = useBottles()

  const {
    data: glasses = [],
    refresh: refreshGlassesList,
  } = useGlasses()

  const {
    freePositions = [0],
    isLoading: posLoading,
    error: posError,
    refresh: refreshFreePosition,
  } = useFreePosition() || {}

  // --- stav zvolené pozice
  const [position, setPosition] = useState(null)

  const updateItem = (idx, newVal) => {
    setItems(prev => prev.map((it, i) => (i === idx ? newVal : it)))
  }

  const addItem = () => {
    if (items.length >= 6) return
    setItems(prev => [...prev, { ingredient: '', volume: 0 }])
  }

  const handleAdd = async () => {
    const trimmedName = drinkName.trim()
    const hasName = trimmedName !== ''

    const filtered = items
      .map(it => ({
        ingredient: (it.ingredient || '').trim(),
        volume: Number(it.volume) || 0,
      }))
      .filter(it => it.ingredient !== '')

    if (!hasName) {
      setStatus('❌ Zadej název drinku')
      return
    }
    if (filtered.length === 0) {
      setStatus('❌ Není vybrána žádná ingredience')
      return
    }
    if (position === null || !freePositions.includes(position)) {
      setStatus('❌ Vyber volnou pozici')
      return
    }

    const nameExists = glasses.some(q =>
      q?.name?.trim().toLowerCase() === trimmedName.toLowerCase()
    )
    if (nameExists) {
      setStatus('❌ Tento název drinku již existuje')
      return
    }

    // fixed-length pole pro backend (6)
    const ingredients6 = Array(6).fill('')
    const volumes6 = Array(6).fill(0)
    filtered.slice(0, 6).forEach((it, i) => {
      ingredients6[i] = it.ingredient
      volumes6[i] = it.volume || 0
    })

    try {
      setSaving(true)
      await addGlass({
        position,
        glass: {
          name: trimmedName,
          ingredients: ingredients6,
          volumes: volumes6,
        },
      })
      setStatus(`✅ "${trimmedName}" byl přidán do fronty na pozici ${position + 1}`)
      setDrinkName('')
      setItems([
        { ingredient: '', volume: 0 },
        { ingredient: '', volume: 0 },
      ])
      // po úspěchu může být pozice obsazena → refrešni seznam i volné pozice
      refreshGlassesList()
    } catch (err) {
      console.error(err)
      setStatus('❌ Chyba při odesílání')
    } finally {
      refreshFreePosition()
      setSaving(false)
    }
  }

  const noFree = !posLoading && !posError && freePositions.length === 0

  return (
    <div className="centered-page">
      <h2>Přidání nového nápoje</h2>
      {status && <p>{status}</p>}

      {posLoading && <p>⏳ Zjišťuji volné pozice…</p>}
      {posError && <p>❌ Nepodařilo se načíst volné pozice</p>}

      {noFree ? (
        <p>⚠️ Žádná volná pozice pro sklenici. Uvolni nejdříve místo.</p>
      ) : isLoading ? (
        <>
          <p>⏳ Načítám ingredience…</p>
          <div className="loading-block">
            <div className="spinner" aria-hidden="true" />
          </div>
        </>
      ) : error ? (
        <p>❌ Nepodařilo se načíst ingredience z backendu</p>
      ) : isNoIngradience && !error ? (
        <p>❌ Žádné ingredience k dispozici. Nejprve je nastav v „Konfigurace lahví“.</p>
      ) : (
        <>
          <div className="field-row">
            <label htmlFor="pos-select" style={{ marginRight: 8 }}>Pozice sklenice:</label>
            <select
              id="pos-select"
              className="input-field"
              value={position ?? ''}
              onChange={e => setPosition(Number(e.target.value))}
              disabled={saving || posLoading}
            >
              <option value="" disabled>Vyber pozici…</option>
              {freePositions.map(p => (
                <option key={p} value={p}>
                  {p + 1}
                </option>
              ))}
            </select>
          
            <label htmlFor="pos-select" style={{ marginRight: 8 }}>Název nápoje:</label>
            <input
              type="text"
              placeholder="Název drinku"
              className="input-field"
              value={drinkName}
              onChange={e => setDrinkName(e.target.value)}
              disabled={saving}
            />
          </div>

          <div className="ingredients-container">
            {items.map((it, idx) => (
              <IngredientCard
                key={idx}
                index={idx}
                value={it}
                onChange={updateItem}
                available={availableIngredients}
                disabled={saving}
              />
            ))}
          </div>

          {/* Přidat ingredienci */}
          <div className="button-row">
            <button
              className="secondary-button"
              onClick={addItem}
              disabled={saving || items.length >= 6}
              title={items.length >= 6 ? 'Maximálně 6 ingrediencí' : 'Přidat ingredienci'}
            >
              ➕ Přidat ingredienci ({items.length}/6)
            </button>
          </div>

          {/* Odeslat do fronty */}
          <div className="button-row">
            <button
              className="add-button"
              onClick={handleAdd}
              disabled={saving || position === null}
              title={position === null ? 'Vyber nejdřív pozici' : 'Přidat drink'}
            >
              ➕ Přiřadit nápoj kde sklenici
            </button>
          </div>
        </>
      )}
    </div>
  )
}

export default NewDrinkCom
