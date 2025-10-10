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
      await deleteGlass({position: position});
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
          <li key={i} className="glass-item">
            <strong>Pozice {i + 1}:</strong> {title}

            <button
              className="delete-button"
              onClick={() => deleteItem(i, glass?.name)}
              disabled={isEmpty}
              title={isEmpty ? 'Pozice je prázdná' : 'Smazat sklenici'}
            >
              Smazat
            </button>
          </li>
        );
      })}
    </ul>
  );
}

export default GlassesList;