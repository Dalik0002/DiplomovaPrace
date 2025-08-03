// src/pages/Setup.jsx
import { useState } from 'react'

function Setup() {
  const [ingredients, setIngredients] = useState([''])

  const handleChange = (index, value) => {
    const updated = [...ingredients]
    updated[index] = value
    setIngredients(updated)
  }

  const addIngredient = () => {
    if (ingredients.length < 6) {
      setIngredients([...ingredients, ''])
    }
  }

  return (
    <div className="centered-page">
      <h1>Setup Ingrediencí</h1>
      {ingredients.map((ing, idx) => (
        <input
          key={idx}
          value={ing}
          onChange={e => handleChange(idx, e.target.value)}
          placeholder={`Ingredience ${idx + 1}`}
          className="input-field"
        />
      ))}
      <button onClick={addIngredient} disabled={ingredients.length >= 6} className="add-button">
        Přidat ingredienci
      </button>
    </div>
  )
}

export default Setup