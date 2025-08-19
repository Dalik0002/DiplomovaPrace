import { useEffect, useState } from 'react'
import { useDrink } from '../state/DrinkContext'
import { assignBottles, getBottles } from '../services/bottleService'
import './Components.css'

function BottleSetUp() {
  const { bottles, setBottles } = useDrink()

  const [status, setStatus] = useState('')
  const [hasData, setHasData] = useState(false)
  const [loading, setLoading] = useState(true)
  const [isEditing, setIsEditing] = useState(false)
  const [saving, setSaving] = useState(false)
  const [serverSnapshot, setServerSnapshot] = useState([]) // poslední potvrzená konfigurace

  // Načtení z backendu
  useEffect(() => {
    const load = async () => {
      setLoading(true)
      setStatus('⏳ Načítám konfiguraci…')
      try {
        const backendData = await getBottles()
        const updated = Array(6).fill().map((_, i) => {
          const match = backendData.find(b => b.position === i)
          return match ? { position: i, bottle: match.bottle } : { position: i, bottle: '' }
        })
        setBottles(updated)
        setServerSnapshot(updated)
        setStatus('✅ Načtena uložená konfigurace')
        setHasData(true)
      } catch (err) {
        console.error(err)
        setStatus('❌ Nepodařilo se načíst konfiguraci z backendu')
        setHasData(false)
      } finally {
        setLoading(false)
      }
    }
    load()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // Lokální změna vstupu (povoleno jen v režimu editace)
  const handleChange = (position, newName) => {
    if (!isEditing || saving) return
    const updated = bottles.map(b =>
      b.position === position ? { ...b, bottle: newName } : b
    )
    setBottles(updated)
  }

  // Přepnutí do režimu editace
  const handleEdit = () => {
    setIsEditing(true)
    setStatus('✏️ Režim úprav - proveď změny a ulož.')
  }

  // Uložení na backend
  const handleSave = async () => {
    setSaving(true)
    setStatus('⏳ Ukládám konfiguraci…')
    try {
      await assignBottles(bottles)
      setServerSnapshot(bottles)
      setIsEditing(false)
      setStatus('✅ Konfigurace uložena')
    } catch (err) {
      console.error(err)
      setStatus('❌ Chyba při ukládání konfigurace')
    } finally {
      setSaving(false)
    }
  }

  // Zrušení změn – návrat na poslední stažený stav
  const handleCancel = () => {
    setBottles(serverSnapshot)
    setIsEditing(false)
    setStatus('↩️ Změny zrušeny')
  }

  // Volitelně: refresh z backendu
  const handleRefresh = async () => {
    setLoading(true)
    setIsEditing(false)
    setSaving(false)
    setStatus('⏳ Obnovuji data…')
    try {
      const backendData = await getBottles()
      const updated = Array(6).fill().map((_, i) => {
        const match = backendData.find(b => b.position === i)
        return match ? { position: i, bottle: match.bottle } : { position: i, bottle: '' }
      })
      setBottles(updated)
      setServerSnapshot(updated)
      setStatus('✅ Obnoveno z backendu')
      setHasData(true)
    } catch (err) {
      console.error(err)
      setStatus('❌ Nepodařilo se obnovit data')
      setHasData(false)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="centered-page">
      <h2>Setup - Konfigurace lahví</h2>
      {status && <p>{status}</p>}

      {loading ? (
        <div className="loading-block">
          <div className="spinner" aria-hidden="true" />
        </div>
      ) : (
        hasData ? (
          <>
            <div className={`bottle-list ${!isEditing ? 'read-only' : ''}`}>
              {bottles.map(({ position, bottle }) => (
                <div key={position} className="bottle-row">
                  <label className="bottle-pos">Pozice {position + 1}:</label>

                  {isEditing ? (
                    <input
                      type="text"
                      value={bottle}
                      onChange={(e) => handleChange(position, e.target.value)}
                      className="input-field"
                      placeholder="Název ingredience"
                      disabled={saving}
                    />
                  ) : (
                    <span className="bottle-name">
                      {bottle || <i style={{ color: "#888" }}>– nezadáno –</i>}
                    </span>
                  )}
                </div>
              ))}
            </div>

            <div className="button-row">
              {!isEditing ? (
                <>
                  <button onClick={handleEdit} className="action-button" disabled={saving}>
                    ✏️ EDIT
                  </button>
                  <button onClick={handleRefresh} className="secondary-button" disabled={saving}>
                    🔄 Obnovit z backendu
                  </button>
                </>
              ) : (
                <>
                  <button onClick={handleSave} className="action-button" disabled={saving}>
                    💾 Uložit
                  </button>
                  <button onClick={handleCancel} className="secondary-button" disabled={saving}>
                    ❌ Zrušit
                  </button>
                </>
              )}
            </div>
          </>
        ) : (
        <></>
        )
      )}
    </div>
  )
}

export default BottleSetUp
