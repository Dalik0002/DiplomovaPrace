// src/state/DrinkContext.jsx

import { createContext, useContext, useState } from 'react'

const DrinkContext = createContext()

export function DrinkProvider({ children }) {
  const [ingredients, setIngredients] = useState([])  // například ["Rum", "Gin", ...]
  const [glasses, setGlasses] = useState(Array(6).fill(''))  // jedna ingredience na sklenku

  return (
    <DrinkContext.Provider value={{
      ingredients, setIngredients,
      glasses, setGlasses
    }}>
      {children}
    </DrinkContext.Provider>
  )
}

export function useDrink() {
  return useContext(DrinkContext)
}
