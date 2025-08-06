import { useDrink } from '../../state/DrinkContext'
import './OrderScreen.css'

function OrderScreen() {
  const { glasses, setGlasses, ingredients } = useDrink()

  const handleSelect = (index, value) => {
    const updated = [...glasses]
    updated[index] = value
    setGlasses(updated)
  }

  return (
    <div className="centered-page">
      <h1>DrinkMaker</h1>
      <div className="glass-grid">
        {glasses.map((content, idx) => (
          <div
            key={idx}
            className={`glass-item ${!content ? 'empty' : ''}`}
          >
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

export default OrderScreen
