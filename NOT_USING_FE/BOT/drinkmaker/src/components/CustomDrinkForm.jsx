import React, { useState } from 'react'

// Form component to build a custom drink.
// Provides fields for the drink name, a dynamic list of ingredients,
// and instructions. On submission, calls the provided callback with
// the constructed drink object.
export default function CustomDrinkForm({ onCreate }) {
  const [name, setName] = useState('')
  const [ingredients, setIngredients] = useState([
    { id: Date.now(), name: '', amount: '' },
  ])
  const [instructions, setInstructions] = useState('')

  const handleIngredientChange = (id, field, value) => {
    setIngredients((prev) =>
      prev.map((ing) =>
        ing.id === id ? { ...ing, [field]: value } : ing,
      ),
    )
  }

  const addIngredient = () => {
    setIngredients((prev) => [
      ...prev,
      { id: Date.now(), name: '', amount: '' },
    ])
  }

  const removeIngredient = (id) => {
    setIngredients((prev) => prev.filter((ing) => ing.id !== id))
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    // Filter out any empty ingredients
    const cleanIngredients = ingredients
      .filter((ing) => ing.name.trim() && ing.amount.trim())
      .map(({ id, ...rest }) => rest)
    if (!name.trim() || cleanIngredients.length === 0 || !instructions.trim()) {
      alert('Prosím vyplňte název, alespoň jednu ingredienci a instrukce.')
      return
    }
    const customDrink = {
      id: Date.now(),
      name: name.trim(),
      description: 'Vlastní recept',
      ingredients: cleanIngredients,
      instructions: instructions
        .split(/\n+/)
        .map((line) => line.trim())
        .filter(Boolean),
    }
    onCreate(customDrink)
    // Reset the form
    setName('')
    setIngredients([{ id: Date.now(), name: '', amount: '' }])
    setInstructions('')
  }

  return (
    <form className="custom-drink-form" onSubmit={handleSubmit}>
      <h2>Vytvořte si vlastní drink</h2>
      <div className="form-group">
        <label htmlFor="drink-name">Název drinku</label>
        <input
          id="drink-name"
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Název vašeho drinku"
        />
      </div>
      <div className="form-group">
        <label>Ingredience</label>
        {ingredients.map((ing, idx) => (
          <div className="ingredient-row" key={ing.id}>
            <input
              type="text"
              value={ing.name}
              onChange={(e) =>
                handleIngredientChange(ing.id, 'name', e.target.value)
              }
              placeholder="Ingredience"
            />
            <input
              type="text"
              value={ing.amount}
              onChange={(e) =>
                handleIngredientChange(ing.id, 'amount', e.target.value)
              }
              placeholder="Množství"
            />
            {ingredients.length > 1 && (
              <button
                type="button"
                className="remove-btn"
                onClick={() => removeIngredient(ing.id)}
              >
                Odstranit
              </button>
            )}
            {idx === ingredients.length - 1 && (
              <button
                type="button"
                className="add-btn"
                onClick={addIngredient}
              >
                Přidat
              </button>
            )}
          </div>
        ))}
      </div>
      <div className="form-group">
        <label htmlFor="instructions">Postup</label>
        <textarea
          id="instructions"
          value={instructions}
          onChange={(e) => setInstructions(e.target.value)}
          rows={4}
          placeholder="Sepište jednotlivé kroky, každý krok na nový řádek..."
        ></textarea>
      </div>
      <button type="submit" className="submit-btn">
        Uložit recept
      </button>
    </form>
  )
}