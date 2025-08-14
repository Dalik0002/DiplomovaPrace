import { createContext, useContext, useState } from 'react'

const DrinkContext = createContext()

export function DrinkProvider({ children }) {
  const [bottles, setBottles] = useState(
    Array(6).fill().map((_, i) => ({ position: i, name: "" }))
  )

  return (
    <DrinkContext.Provider value={{ bottles, setBottles }}>
      {children}
    </DrinkContext.Provider>
  )
}

export function useDrink() {
  return useContext(DrinkContext)
}
