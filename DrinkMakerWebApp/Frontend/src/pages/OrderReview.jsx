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

  const hasContent = (g) =>
    Array.isArray(g?.ingredients) &&
    Array.isArray(g?.volumes) &&
    g.ingredients.some((ing, i) => (ing?.trim?.() ?? '') !== '' && (g.volumes[i] ?? 0) > 0)

  const slots = useMemo(
    () => Array.from({ length: 6 }, (_, i) => glasses?.[i] ?? null),
    [glasses]
  )

  const anyGlass = useMemo(() => slots.some(g => g && hasContent(g)), [slots])

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
      navigate('/pouring')
    } catch (err) {
      console.error('Chyba při startu nalévání:', err)
      setStatus('❌ Chyba při startu nalévání')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="orderreview-page">
      <div className="orderreview-shell">
        <button className="back-button" onClick={() => navigate('/')}>
          Zpět
        </button>

        <div className="orderreview-card">
          <h1 className="orderreview-title">SOUHRN</h1>

          {status && <p className="orderreview-status">{status}</p>}

          {isLoading ? (
            <p className="orderreview-info">⏳ Načítám sklenice…</p>
          ) : error ? (
            <p className="orderreview-info">❌ Nepodařilo se načíst sklenice</p>
          ) : (
            <>
              <div className="orderreview-list">
                {slots.map((g, idx) => (
                  <div className={`orderreview-item ${g && hasContent(g) ? "filled" : ""}`} key={idx}>
                    <div className="orderreview-item-head">
                      <h3>Pozice {idx + 1}</h3>
                    </div>

                    {g === null ? (
                      <p className="orderreview-empty">Není přiřazeno</p>
                    ) : hasContent(g) ? (
                      <div className="orderreview-ing-list">
                        {g.ingredients.map((ing, i) => {
                          const vol = g.volumes?.[i] ?? 0
                          if (!ing?.trim() || vol <= 0) return null

                          return (
                            <div className="orderreview-ing-row" key={i}>
                              <span>{ing}</span>
                              <strong>{vol} ml</strong>
                            </div>
                          )
                        })}
                      </div>
                    ) : (
                      <p className="orderreview-empty">Bez obsahu</p>
                    )}
                  </div>
                ))}
              </div>

              <div className="orderreview-actions">
                <button
                  className="start-button"
                  onClick={handleConfirm}
                  disabled={!anyGlass || saving}
                >
                  {saving ? '⏳ Spouštím…' : '✅ Potvrdit a začít nalévat'}
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  )
}

export default OrderReview