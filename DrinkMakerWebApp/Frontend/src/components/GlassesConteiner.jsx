import { useNavigate } from 'react-router-dom'
import './GlassesConteiner.css'
import { useNumberOfGlasses, useGlasses } from '../hooks/useGlassesData'

function GlassesConteiner() {
  const navigate = useNavigate()

  const {
    data: glasses = [],
    isLoading: glassesLoading,
    error: glassesError,
    refresh,
    noGlass: isAllEmpty
  } = useGlasses()

  const {
    drinkCount: glassesCount = 0,
    isLoading: countLoading,
  } = useNumberOfGlasses()


  const isLoading = glassesLoading || countLoading

  return (
    <div className="glasses-container">
      <h2 className="glasses-container-title">STANOVIŠTĚ</h2>

      <div className="glasses-container-list">
        {isLoading ? (
          <p>Načítám…</p>
        ) : glassesError ? (
          <p className="error-message">Chyba při získávání dat.</p>
        ) : isAllEmpty ? (
          <p className="glasses-container-empty">Žádná sklenice není navolena.</p>
        ) : (
          <ul className="glasses-grid">
            {glasses.map((glass, index) => {
              const isEmpty = glass == null
              return (
                <li
                  key={index}
                  className={`glass-tile ${isEmpty ? 'glass-tile--empty' : ''}`}
                >
                  <div className="glass-tile-title">STANOVIŠTĚ {index + 1}:</div>

                  {isEmpty ? (
                    <div className="glass-tile-sub">Volné</div>
                  ) : (
                    <div className="glass-tile-name">
                      {glass?.name || `Drink ${index + 1}`}
                    </div>
                  )}
                </li>
              )
            })}
          </ul>
        )}
      </div>


      <div className="glasses-container-info">
        Obsazeno: {glassesCount}/6 sklenic
      </div>

      <button className="action-button" onClick={() => navigate('/editGlasses')}>
        Upravit sklenice
      </button>
    </div>
  )
}

export default GlassesConteiner