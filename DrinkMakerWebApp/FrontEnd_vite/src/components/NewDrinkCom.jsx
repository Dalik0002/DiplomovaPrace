import { useState, useEffect } from 'react'
import { addToQueue } from '../services/queueService'
import IngredientCard from './IngredientCard'

import { useBottles } from '../hooks/useBottleData'
import { useQueueList } from '../hooks/useQueueData'

function NewDrinkCom() {
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
    isNoIngradience,
  } = useBottles()

  const {
    data: queue = [],
    refresh: refreshQueueList,
  } = useQueueList();

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


    const filtered = items.filter(it => it.ingredient.trim() !== '')
    if (!hasName) {
      setStatus('❌ Zadej název drinku')
      return
    }
    if (filtered.length === 0) {
      setStatus('❌ Není vybrána žádná ingredience')
      return
    }

    const nameExists = queue.some(q =>
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
      await addToQueue({ name: drinkName, ingredients: ingredients6, volumes: volumes6 })
      setStatus(`✅ "${drinkName}" byl přidán do fronty`)
      setDrinkName('')
      setItems([
        { ingredient: '', volume: 0 },
        { ingredient: '', volume: 0 },
      ])

      refreshQueueList()
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
      {isLoading ? (
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

export default NewDrinkCom
