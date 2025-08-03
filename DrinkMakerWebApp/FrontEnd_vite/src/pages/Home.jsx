// src/pages/Home.jsx
import { useState } from 'react'

function Home() {
  const [glassContents, setGlassContents] = useState(Array(6).fill(''))

  const handleSelect = (index, value) => {
    const updated = [...glassContents]
    updated[index] = value
    setGlassContents(updated)
  }

  const ingredients = ['Rum', 'Gin', 'Tonic', 'Vodka', 'Whisky', 'Pepsi']

  return (
    <div className="centered-page">
      <h1>DrinkMaker – Domů</h1>
      <div className="glass-container">
        {glassContents.map((content, idx) => (
          <div key={idx} className="glass-item">
            <p>Sklenka {idx + 1}</p>
            <select
              value={content}
              onChange={e => handleSelect(idx, e.target.value)}
              className="input-field"
            >
              <option value="">--Vyber ingredienci--</option>
              {ingredients.map((ing, i) => (
                <option key={i} value={ing}>{ing}</option>
              ))}
            </select>
          </div>
        ))}
      </div>
    </div>
  )
}

export default Home