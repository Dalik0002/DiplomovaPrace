import { useState, useEffect } from 'react'
import { addToQueue } from '../services/queueService'
import { getBottles } from '../services/bottleService'
import IngredientCard from './IngredientCard'

function OrderReviewCom() {
  const [drinkName, setDrinkName] = useState('')
  const [items, setItems] = useState([
    { ingredient: '', volume: 0 },
    { ingredient: '', volume: 0 },
  ])
  const [emptyIngredient, setEmptyIngredient] = useState(false)
  const [fetchError, setFetchError] = useState(false)
  const [availableIngredients, setAvailableIngredients] = useState([])
  const [status, setStatus] = useState('')
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    const load = async () => {
      setLoading(true)
      setStatus('⏳ Načítám ingredience…')
      try {
        const backendData = await getBottles()
        const names = backendData
          .map(b => b.name || b.bottle)
          .filter(name => name && name.trim() !== '')
        setAvailableIngredients(names)
        if (names.length === 0) {
          setStatus('❌ Žádné ingredience k dispozici. Nejprve je nastav v „Konfigurace lahví“.')
          setEmptyIngredient(true)
          setFetchError(false)
        } else {
          setStatus('✅ Ingredience načteny')
          setEmptyIngredient(false)
          setFetchError(false)
        }
      } catch (err) {
        console.error(err)
        setStatus('❌ Nepodařilo se načíst ingredience z backendu')
        setEmptyIngredient(true)
        setFetchError(true)
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  const updateItem = (idx, newVal) => {
    setItems(prev => prev.map((it, i) => (i === idx ? newVal : it)))
  }

  const addItem = () => {
    if (items.length >= 6) return
    setItems(prev => [...prev, { ingredient: '', volume: 0 }])
  }

  const handleAdd = async () => {
    const hasName = drinkName.trim() !== ''
    const filtered = items.filter(it => it.ingredient.trim() !== '')
    if (!hasName) {
      setStatus('❌ Zadej název drinku')
      return
    }
    if (filtered.length === 0) {
      setStatus('❌ Není vybrána žádná ingredience')
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
      await addToQueue({ name: drinkName, ingredients: ingredients6, volumes: volumes6 })
      setStatus(`✅ "${drinkName}" byl přidán do fronty`)
      setDrinkName('')
      setItems([
        { ingredient: '', volume: 0 },
        { ingredient: '', volume: 0 },
      ])
    } catch (err) {
      console.error(err)
      setStatus('❌ Chyba při odesílání')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="centered-page">
      <h2>Přidání nového drinku</h2>
      {status && <p>{status}</p>}

      {loading ? (
        <div className="loading-block">
          <div className="spinner" aria-hidden="true" />
        </div>
      ) : fetchError ? (
        <></>
      ) : emptyIngredient && !fetchError ? (
        <></>
      ) : (
        <>
          {/* Název drinku */}
          <input
            type="text"
            placeholder="Název drinku"
            className="input-field"
            value={drinkName}
            onChange={e => setDrinkName(e.target.value)}
            disabled={saving}
          />

          {/* Seznam ingrediencí (karty) */}
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
            <button className="add-button" onClick={handleAdd} disabled={saving}>
              ➕ Přidat drink do fronty
            </button>
          </div>
        </>
      )}
    </div>
  )
}

export default OrderReviewCom
