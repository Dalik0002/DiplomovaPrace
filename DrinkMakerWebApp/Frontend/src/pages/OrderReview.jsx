import { useNavigate } from 'react-router-dom'
import { useMemo, useState } from 'react'
import './OrderReview.css'

import { useGlasses } from '../hooks/useGlassesData'
import { startPouring } from '../services/general'

function OrderReview() {
  const navigate = useNavigate()
  const {
    data: glasses = [],
    refresh: refreshGlassesList,
    isLoading,
    error,
  } = useGlasses()

  const [status, setStatus] = useState('')
  const [saving, setSaving] = useState(false)

  // helper: má sklenice aspoň jednu položku s >0 ml?
  const hasContent = (g) =>
    Array.isArray(g?.ingredients) &&
    Array.isArray(g?.volumes) &&
    g.ingredients.some((ing, i) => (ing?.trim?.() ?? '') !== '' && (g.volumes[i] ?? 0) > 0)

  // Vytvoř pole jen z platných (ne-null) a neprázdných sklenic
  const filledGlasses = useMemo(() => {
    return (glasses || []).filter(g => g && hasContent(g))
  }, [glasses])

  const anyGlass = filledGlasses.length > 0

  const handleConfirm = async () => {
    if (!anyGlass) {
      setStatus('❌ Není připravena žádná sklenice')
      return
    }
    try {
      setSaving(true)
      setStatus('⏳ Odesílám požadavek na zahájení nalévání…')
      await startPouring()
      setStatus('✅ Nalévání spuštěno')
      refreshGlassesList()
    } catch (err) {
      console.error('Chyba při startu nalévání:', err)
      setStatus('❌ Chyba při startu nalévání')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="pages-centered-page">
      <button className="back-button" onClick={() => navigate('/')}>Zpět</button>
      <h1>Souhrn sklenic</h1>
      {status && <p>{status}</p>}

      {isLoading ? (
        <p>⏳ Načítám sklenice…</p>
      ) : error ? (
        <p>❌ Nepodařilo se načíst sklenice</p>
      ) : !anyGlass ? (
        <p>⚠️ Zatím nejsou připravené žádné sklenice.</p>
      ) : (
        <>
          <div className="review-glasses-grid">
            {filledGlasses.map((g, idx) => (
              <div className="review-glass-card" key={idx}>
                <div className="review-glass-header">
                  <h3 className="review-glass-title">{g.name || `Sklenice ${idx + 1}`}</h3>
                </div>
                <ul className="review-ing-list">
                  {g.ingredients.map((ing, i) => {
                    const vol = g.volumes?.[i] ?? 0
                    if (!ing?.trim() || vol <= 0) return null
                    return <li key={i}>{ing} — {vol} ml</li>
                  })}
                </ul>
              </div>
            ))}
          </div>

          <div className="review-confirm-row">
            <button
              className="start-button"
              onClick={handleConfirm}
              disabled={!anyGlass || saving}
            >
              ✅ POTVRDIT A ZAČÍT NALÉVAT
            </button>
          </div>
        </>
      )}
    </div>
  )
}

export default OrderReview
