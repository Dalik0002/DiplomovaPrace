import { deleteGlass } from '../services/glassesService'
import { useEffect, useState } from 'react'
import './GlassesList.css'
import { useGlasses } from '../hooks/useGlassesData';

function GlassesList() {

  const {
    data: glasses = [],
    isLoading,
    error,
    refresh,
  } = useGlasses();

  const deleteItem = async (position) => {
    try {
      await deleteGlass({position});
      refresh();
    } catch (err) {
      console.error('Chyba při mazání sklenice:', err);
    }
  };

  if (isLoading) return <p>Načítání…</p>;
  if (error) return <p className='error-message'>Chyba při načítání sklenic.</p>;

    return (
    <ul className="glasses-list">
      {glasses.map((glass, i) => {
        const isEmpty = !glass;
        const title = isEmpty ? 'Prázdná' : (glass.name || `Drink ${i + 1}`);

        return (
          <li key={i} className={`glass-card ${isEmpty ? 'glass-card--empty' : ''}`}>
            {/* 1. Stanoviště */}
            <div className="glass-card-pos">
              Stanoviště {i + 1}
            </div>

            {/* 2. Název */}
            <div className="glass-card-title">
              {title}
            </div>

            {/* 3. Ingredience */}
            {!isEmpty && Array.isArray(glass.ingredients) && (
              <div className="glass-ingredients-grid">
                {glass.ingredients.map((ing, idx) => {
                  const vol = glass.volumes?.[idx] ?? 0

                  if (!ing || vol <= 0) return null

                  return (
                    <div key={idx} className="glass-ingredient-item">
                      <span className="glass-ingredient-name">{ing}</span>
                      <span className="glass-ingredient-vol">{vol} ml</span>
                    </div>
                  )
                })}
              </div>
            )}

            {/* 4. Koš */}
            <button
              className="delete-button"
              onClick={() => deleteItem(i)}
              disabled={isEmpty}
              title={isEmpty ? 'Stanoviště je prázdné' : 'Smazat sklenici'}
            >
              🗑️
            </button>

          </li>
        );
      })}
    </ul>
  );
}

export default GlassesList;