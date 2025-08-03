import React from 'react'

// Receives a list of drinks and a callback to handle selection.
// Displays each drink name and description in a clickable card.
export default function DrinkList({ drinks, onSelect }) {
  return (
    <div className="drink-list">
      {drinks.map((drink) => (
        <div
          key={drink.id}
          className="drink-card"
          onClick={() => onSelect(drink)}
          role="button"
          tabIndex={0}
          onKeyPress={(e) => {
            if (e.key === 'Enter' || e.key === ' ') onSelect(drink)
          }}
        >
          <h3>{drink.name}</h3>
          <p>{drink.description}</p>
        </div>
      ))}
    </div>
  )
}