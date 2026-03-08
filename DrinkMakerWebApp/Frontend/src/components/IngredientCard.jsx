function IngredientCard({ index, value, onChange, available, disabled, currentTotal, MAX_TOTAL }) {
  const handleSelect = (e) => {
    const ing = e.target.value
    // Při výběru zkusíme nastavit 10ml, ale jen pokud je ještě místo
    const remaining = MAX_TOTAL - currentTotal
    const vol = value.volume > 0 ? value.volume : (remaining >= 10 ? 10 : remaining)
    onChange(index, { ingredient: ing, volume: ing ? vol : 0 })
  }

  const handleVolume = (e) => {
    const newValue = parseInt(e.target.value, 10) || 0
    const otherIngredientsTotal = currentTotal - value.volume
    const allowedMax = MAX_TOTAL - otherIngredientsTotal

    const finalValue = newValue > allowedMax ? allowedMax : newValue
    
    onChange(index, { ...value, volume: finalValue })
  }

  return (
    <div className={`ingredient-item ${!value.ingredient ? 'empty' : ''}`}>
      <p><strong>Ingredience</strong></p>
      <select
        value={value.ingredient}
        onChange={handleSelect}
        className="input-field"
        disabled={disabled}
        style={{ width: '200px'}}
      >
        <option value="">--Ingredience--</option>
        {available.map((ing, i) => (
          <option key={i} value={ing}>{ing}</option>
        ))}
      </select>

      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', width: '100%', marginTop: '5px' }}>
        <input
          type="range"
          min="0"
          max={MAX_TOTAL}
          step="5"
          value={value.volume}
          onChange={handleVolume}
          disabled={disabled || !value.ingredient}
          style={{ flex: 1, cursor: 'pointer', accentColor: '#ff4081' }}
        />
        <span style={{ 
          minWidth: '55px', 
          fontWeight: 'bold', 
          color: value.ingredient ? '#ffffff' : '#888',
          fontSize: '1.1rem'
        }}>
          {value.volume} ml
        </span>
      </div>
    </div>
  )
}

export default IngredientCard