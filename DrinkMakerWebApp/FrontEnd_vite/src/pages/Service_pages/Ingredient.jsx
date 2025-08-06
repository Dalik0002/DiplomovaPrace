// src/Service_pages/Ingredient.jsx (nebo Setup.jsx)

import { useState } from 'react'
import { useDrink } from '../../state/DrinkContext'

function Ingredient() {
  const { ingredients, setIngredients } = useDrink()
  const [newIngredient, setNewIngredient] = useState('')

  const handleAdd = () => {
    if (newIngredient.trim() !== '' && ingredients.length < 6 && !ingredients.includes(newIngredient)) {
      setIngredients([...ingredients, newIngredient])
      setNewIngredient('')
    }
  }

  const handleRemove = (indexToRemove) => {
    const updated = ingredients.filter((_, index) => index !== indexToRemove)
    setIngredients(updated)
  }

  return (
    <div className="centered-page">
      <h2>Setup – Ingredience</h2>

      <div className="input-group">
        <input
          type="text"
          value={newIngredient}
          onChange={(e) => setNewIngredient(e.target.value)}
          placeholder="Zadej název ingredience"
          className="input-field"
        />
        <button onClick={handleAdd} className="action-button">
          Přidat
        </button>
      </div>

      <ul className="ingredient-list">
        {ingredients.map((ing, idx) => (
          <li key={idx}>
            {ing}
            <button onClick={() => handleRemove(idx)} className="remove-button">
              ✕
            </button>
          </li>
        ))}
      </ul>

      <p>{ingredients.length}/6 ingrediencí</p>
    </div>
  )
}

export default Ingredient
