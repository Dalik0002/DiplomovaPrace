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

  const getStateClass = (state) => {

  };

  const isLoading = glassesLoading || countLoading

  return (
    <div className="glasses-container">
      <h2 className="glasses-container-title">Sklenice</h2>

      <div className="glasses-container-list">
        {isLoading ? (
          <p>Načítám…</p>
        ) : glassesError ? (
          <p className="glasses-container-empty">Nepodařilo se načíst sklenice</p>
        ) : isAllEmpty ? (
          <p className="glasses-container-empty">Žádná sklenice navolena</p>
        ) : (
          <ul>
            {glasses.map((glass, index) => {
              const isEmpty = glass == null;
              return (
                <li
                  key={index}
                  className={isEmpty ? 'glass-container-empty' : 'glass-container-item'}
                >
                  {isEmpty ? (
                    <em>Pozice sklenice {index + 1} volná</em>
                  ) : (
                    <>
                      <strong>Pozice {index + 1}:</strong> {glass?.name || `Drink ${index + 1}`}
                    </>
                  )}
                </li>
              );
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