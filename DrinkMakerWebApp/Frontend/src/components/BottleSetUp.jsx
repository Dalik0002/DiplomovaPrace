// src/pages/BottleSetUp.jsx
import { useState } from 'react';
import { assignBottles } from '../services/bottleService';
import './BottleSetUp.css';
import { useBottles} from '../hooks/useBottleData';

function BottleSetUp() {
  const [isEditing, setIsEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [status, setStatus] = useState('');

  const { 
    data, 
    error, 
    isLoading,
    refresh, 
    mutate,
  } = useBottles(isEditing);

  // Odvozený seznam 6 pozic (bez lokálního stavu)
  const rows = Array.from({ length: 6 }, (_, i) => {
    const match = data?.find(b => b.position === i);
    return match ? { position: i, bottle: match.bottle || '' } : { position: i, bottle: '' };
  });

  const handleEdit = () => {
    setIsEditing(true);
    setStatus('✏️ Režim úprav – proveď změny a ulož.');
  };

  const handleChange = (position, newName) => {
    if (!isEditing || saving) return;
    // optimisticky upravíme SWR cache (bez fetch)
    const next = rows.map(b => b.position === position ? { ...b, bottle: newName } : b);
    refresh(next, false);
  };

  const handleSave = async () => {
    setSaving(true);
    setStatus('⏳ Ukládám konfiguraci…');
    try {
      await assignBottles(rows); // očekává [{position,bottle}]
      setIsEditing(false);
      setStatus('✅ Konfigurace uložena');
      await refresh();            // revalidace z backendu
    } catch (e) {
      console.error(e);
      setStatus('❌ Chyba při ukládání konfigurace');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (position, newName) => {
    if (!isEditing || saving) return;
    const next = rows.map(b => b.position === position ? { ...b, bottle: '' } : b);
    refresh(next, false);
  };

  const handleCancel = async () => {
    setIsEditing(false);
    setStatus('↩️ Změny zrušeny');
    await refresh(); // stáhne zpět serverový stav a přepíše optimistické změny
  };

  return (
    <div className="centered-page">
      <h2>KONFIGURACE LAHVÍ</h2>
      {status && <p>{status}</p>}

      {isLoading ? (
        <>
          <p>⏳ Načítám konfiguraci…</p>
          <div className="loading-block"><div className="spinner" aria-hidden="true" /></div>
        </>
      ) : error ? (
        <p>❌ Nepodařilo se načíst data z backendu</p>
      ) : (
        <>
          <div className={`bottle-list ${!isEditing ? 'read-only' : ''}`}>
            {rows.map(({ position, bottle }) => (
              <div key={position} className="bottle-row">
                <label className="bottle-pos">Pozice {position + 1}:</label>

                {isEditing ? (
                  <>
                    <input
                      type="text"
                      value={bottle}
                      onChange={(e) => handleChange(position, e.target.value)}
                      className="input-field"
                      placeholder="Název ingredience"
                      disabled={saving}
                    />
                    <button className="delete-button" onClick={(e) => handleDelete(position, e.target.value)}> Smazat </button>
                  </>
                ) : (
                  <span className="bottle-name">
                    {bottle || <i style={{ color: '#888' }}>– nezadáno –</i>}
                  </span>
                )}
              </div>
            ))}
          </div>

          <div className="button-row">
            {!isEditing ? (
              <button onClick={handleEdit} className="action-button" disabled={saving}>
                ✏️ EDIT
              </button>
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
      )}
    </div>
  );
}

export default BottleSetUp;
