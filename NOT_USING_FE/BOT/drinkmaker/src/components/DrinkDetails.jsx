import React from 'react'

// Shows detailed information about a single drink.
// Accepts the drink object and a callback to go back to the list.
export default function DrinkDetails({ drink, onBack }) {
  return (
    <div className="drink-details">
      <button className="back-button" onClick={onBack}>&larr; Zpět</button>
      <h2>{drink.name}</h2>
      <h3>Ingredience</h3>
      <ul className="ingredient-list">
        {drink.ingredients.map((item, idx) => (
          <li key={idx}>
            <strong>{item.name}</strong>: {item.amount}
          </li>
        ))}
      </ul>
      <h3>Postup</h3>
      <ol className="instruction-list">
        {drink.instructions.map((step, idx) => (
          <li key={idx}>{step}</li>
        ))}
      </ol>
    </div>
  )
}