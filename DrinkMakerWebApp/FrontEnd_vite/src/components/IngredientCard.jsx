import './Components.css'


function IngredientCard({ index, value, onChange, available, disabled }) {
  const handleSelect = (e) => {
    const ing = e.target.value
    // pokud ještě není objem, nastav default 100 ml
    const vol = value.volume > 0 ? value.volume : 100
    onChange(index, { ingredient: ing, volume: ing ? vol : 0 })
  }

  const handleVolume = (e) => {
    const v = parseInt(e.target.value, 10)
    onChange(index, { ...value, volume: isNaN(v) ? 0 : v })
  }

  return (
    <div className={`ingredient-item ${!value.ingredient ? 'empty' : ''}`}>
      <p>Ingredience {index + 1}</p>
      <select
        value={value.ingredient}
        onChange={handleSelect}
        className="input-field"
        disabled={disabled}
      >
        <option value="">--Ingredience--</option>
        {available.map((ing, i) => (
          <option key={i} value={ing}>{ing}</option>
        ))}
      </select>

      <input
        type="number"
        className="input-field"
        placeholder="Objem (ml)"
        min="0"
        max="250"
        value={value.volume}
        onChange={handleVolume}
        disabled={disabled || !value.ingredient}
      />
    </div>
  )
}

export default IngredientCard