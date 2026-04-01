import { useState } from 'react'
import { addGlass } from '../services/glassesService'
import IngredientCard from './IngredientCard'
import { useNavigate, useLocation } from 'react-router-dom'

import { useBottles } from '../hooks/useBottleData'
import { useFreePosition } from '../hooks/useGlassesData'

import './NewDrinkCom.css'

function NewDrinkCom() {
  const navigate = useNavigate()
  const location = useLocation()

  const preselectedPosition = location.state?.preselectedPosition
  const initialGlass = location.state?.initialGlass || null
  const editMode = !!location.state?.editMode

  const position = typeof preselectedPosition === 'number' ? preselectedPosition : null

 const getInitialItems = () => {
  const ingredients = Array.isArray(initialGlass?.ingredients) ? initialGlass.ingredients : []
  const volumes = Array.isArray(initialGlass?.volumes) ? initialGlass.volumes : []

  const mapped = ingredients
      .map((ingredient, idx) => ({
        ingredient: String(ingredient || '').trim(),
        volume: Number(volumes[idx]) || 0,
      }))
      .filter((it) => it.ingredient !== '')

    if (mapped.length > 0) return mapped

    return [
      { ingredient: '', volume: 0 },
      { ingredient: '', volume: 0 },
    ]
  }

const [items, setItems] = useState(getInitialItems)


  const [status, setStatus] = useState('')
  const [saving, setSaving] = useState(false)

  const MAX_TOTAL_ML = 200

  const {
    isLoading,
    error,
    availableIngredients,
    isNoIngredient,
  } = useBottles()

  const {
    freePositions = [],
    isLoading: posLoading,
    error: posError,
    refresh: refreshFreePosition,
  } = useFreePosition() || {}

  const currentTotalVolume = items.reduce((sum, it) => sum + (Number(it.volume) || 0), 0)

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
    const filtered = items
      .map(it => ({
        ingredient: (it.ingredient || '').trim(),
        volume: Number(it.volume) || 0,
      }))
      .filter(it => it.ingredient !== '')

    if (position === null) {
      setStatus('❌ Chybí informace o stanovišti')
      return
    }

    if (!editMode && !freePositions.includes(position)) {
      setStatus('❌ Toto stanoviště už není volné')
      return
    }

    if (filtered.length === 0) {
      setStatus('❌ Není vybrána žádná ingredience')
      return
    }

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
          name: '',
          ingredients: ingredients6,
          volumes: volumes6,
        },
      })

      setStatus(
        editMode
          ? `✅ Nápoj na pozici ${position + 1} byl upraven`
          : `✅ Nápoj byl přidán na pozici ${position + 1}`
      )

      if (!editMode) {
        setItems([
          { ingredient: '', volume: 0 },
          { ingredient: '', volume: 0 },
        ])
      }
      
      navigate('/')
    } catch (err) {
      console.error(err)
      setStatus('❌ Chyba při odesílání')
    } finally {
      refreshFreePosition()
      setSaving(false)
    }
  }

  const noFree = !editMode && !posLoading && !posError && freePositions.length === 0
  const stationNotAvailable =
    !editMode &&
    position !== null &&
    !posLoading &&
    !posError &&
    !freePositions.includes(position)

  return (
    <div className="newdrink-card">
      <h2 className="newdrink-title">
        {editMode ? 'ÚPRAVA NÁPOJE' : 'PŘIDÁNÍ NOVÉHO NÁPOJE'}
      </h2>

      <div className="selected-station-box">
        Stanoviště {position != null ? position + 1 : '—'}
      </div>

      {status && <p className="newdrink-status">{status}</p>}
      {posLoading && <p className="newdrink-info">⏳ Zjišťuji volné pozice…</p>}
      {posError && <p className="newdrink-info">❌ Nepodařilo se načíst volné pozice</p>}

      {position === null ? (
        <p className="newdrink-info">❌ Chybí vybrané stanoviště. Vrať se na dashboard.</p>
      ) : stationNotAvailable ? (
        <p className="newdrink-info">⚠️ Toto stanoviště už není volné.</p>
      ) : noFree ? (
        <p className="newdrink-info">⚠️ Všechna stanoviště jsou obsazena.</p>
      ) : isLoading ? (
        <>
          <p className="newdrink-info">⏳ Načítám ingredience…</p>
          <div className="loading-block">
            <div className="spinner" aria-hidden="true" />
          </div>
        </>
      ) : error ? (
        <p className="newdrink-info">❌ Nepodařilo se načíst data z backendu</p>
      ) : isNoIngredient ? (
        <p className="newdrink-info">❌ Žádné ingredience k dispozici. Nejprve je nastav v „Konfigurace lahví“.</p>
      ) : (
        <>
          <div className="ingredients-container">
            {items.map((it, idx) => (
              <IngredientCard
                key={idx}
                index={idx}
                value={it}
                onChange={updateItem}
                available={availableIngredients}
                disabled={saving}
                currentTotal={currentTotalVolume}
                MAX_TOTAL={MAX_TOTAL_ML}
              />
            ))}
          </div>

          <div className="volume-summary">
            Využito: {currentTotalVolume} / {MAX_TOTAL_ML} ml
          </div>

          <div className="button-row compact-actions">
            <button
              className="secondary-button"
              onClick={addItem}
              disabled={saving || items.length >= 6}
              title={items.length >= 6 ? 'Maximálně 6 ingrediencí' : 'Přidat ingredienci'}
            >
              ➕ Přidat
            </button>

            <button
              className="secondary-button"
              onClick={removeItem}
              disabled={saving || items.length === 1}
              title={items.length <= 1 ? 'Musí zůstat alespoň 1 ingredience' : 'Odebrat ingredienci'}
            >
              ➖ Odebrat
            </button>
          </div>

          <div className="button-row">
            <button
              className="add-button"
              onClick={handleAdd}
              disabled={saving || position === null || stationNotAvailable}
            >
              {saving
                ? 'Odesílám…'
                : editMode
                  ? '💾 Uložit změny'
                  : '➕ Přiřadit nápoj ke sklenici'}
            </button>
          </div>
        </>
      )}
    </div>
  )
}

export default NewDrinkCom