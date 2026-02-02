//NewDrinkCom.jsx
import { useState } from 'react'
import { addGlass } from '../services/glassesService'
import IngredientCard from './IngredientCard'
import { useNavigate } from 'react-router-dom'

import { useBottles } from '../hooks/useBottleData'
import { useGlasses, useFreePosition } from '../hooks/useGlassesData'

import './NewDrinkCom.css'


function NewDrinkCom() {
  const navigate = useNavigate()
  const [drinkName, setDrinkName] = useState('')

  const [items, setItems] = useState([
    { ingredient: '', volume: 0 },
    { ingredient: '', volume: 0 },
  ])
  const [status, setStatus] = useState('')
  const [saving, setSaving] = useState(false)

  const {
    isLoading,
    error,
    availableIngredients, 
    isNoIngredient,
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

  const [position, setPosition] = useState(null)

  const updateItem = (idx, newVal) => {
    setItems(prev => prev.map((it, i) => (i === idx ? newVal : it)))
  }

  const addItem = () => {
    if (items.length >= 6) return
    setItems(prev => [...prev, { ingredient: '', volume: 0 }])
  }

  const removeItem = () => {
    if (items.length <= 1) return
    setItems(prev => prev.slice(0, -1))
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

      setPosition(null)
      refreshGlassesList()
    } catch (err) {
      console.error(err)
      setStatus('❌ Chyba při odesílání')
    } finally {
      refreshFreePosition()
      setSaving(false)
      navigate('/')
    }
  }

  const noFree = !posLoading && !posError && freePositions.length === 0

  const isFree = (i) => freePositions.includes(i)

  return (
    <div className="centered-page">
      <h2>PŘIDÁNÍ NOVÉHO NÁPOJE</h2>
      {status && <p>{status}</p>}

      {posLoading && <p>⏳ Zjišťuji volné pozice…</p>}
      {posError && <p>❌ Nepodařilo se načíst volné pozice</p>}

      {noFree ? (
        <p>⚠️ Již si zaplnil všechny volné pozice.</p>
      ) : isLoading ? (
        <>
          <p>⏳ Načítám ingredience…</p>
          <div className="loading-block">
            <div className="spinner" aria-hidden="true" />
          </div>
        </>
      ) : error ? (
        <p>❌ Nepodařilo se načíst data z backendu</p>
      ) : isNoIngredient && !error ? (
        <p>❌ Žádné ingredience k dispozici. Nejprve je nastav v „Konfigurace lahví“.</p>
      ) : (
        <>
          {/* --- výběr pozice pomocí 6 čtverečků --- */}
          <div className="field-column">
            <label style={{ marginBottom: 8, fontWeight: 700 }}>Stanoviště:</label>

            <div className="pos-grid" role="tablist" aria-label="Výběr pozice sklenice">
              {Array.from({ length: 6 }, (_, i) => {
                const active = position === i
                const free = isFree(i)
                const occupied = !free

                return (
                  <button
                    key={i}
                    type="button"
                    role="tab"
                    aria-selected={active}
                    className={[
                      'pos-tile',
                      active ? 'is-active' : '',
                      occupied ? 'is-occupied' : '',
                    ].join(' ')}
                    onClick={() => {
                      if (saving || posLoading || !free) return
                      setPosition(i)
                      setStatus('')
                    }}
                    disabled={saving || posLoading || !free}
                    title={
                      occupied
                        ? `Pozice ${i + 1} je obsazená`
                        : `Vybrat pozici ${i + 1}`
                    }
                  >
                    {i + 1}
                  </button>
                )
              })}
            </div>

            <label htmlFor="drink-name" style={{ marginTop: 14, marginBottom: 8, fontWeight: 700 }}>
              Název nápoje (max 10 znaků):
            </label>
            <input
              id="drink-name"
              type="text"
              style={{ width: '100px'}}
              placeholder="Název nápoje"
              className="input-field"
              value={drinkName}
              onChange={(e) => setDrinkName(e.target.value)}
              disabled={saving}
              maxLength={10}
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

          <div className="button-row">
            <button
              className="secondary-button"
              onClick={addItem}
              disabled={saving || items.length >= 6}
              title={items.length >= 6 ? 'Maximálně 6 ingrediencí' : 'Přidat ingredienci'}
            >
              ➕ Přidat ingredienci ({items.length}/6)
            </button>
            <button
              className="secondary-button"
              onClick={removeItem}
              disabled={saving || items.length === 1}
              title={items.length <= 1 ? 'Musí zůstat alespoň 1 ingredience' : 'Odebrat ingredienci'}
            >
              ➖ Odebrat ingredienci ({items.length}/6)
            </button>
          </div>

          <div className="button-row">
            <button
              className="add-button"
              onClick={handleAdd}
              disabled={saving || position === null}
              title={position === null ? 'Vyber nejdřív pozici' : 'Přidat drink'}
            >
              ➕ Přiřadit nápoj ke sklenici
            </button>
          </div>
        </>
      )}
    </div>
  )
}

export default NewDrinkCom