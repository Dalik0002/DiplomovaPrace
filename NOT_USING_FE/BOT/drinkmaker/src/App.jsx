import React, { useState } from 'react'
import drinksData from './data/drinks'
import DrinkList from './components/DrinkList'
import DrinkDetails from './components/DrinkDetails'
import CustomDrinkForm from './components/CustomDrinkForm'
import Navbar from './components/Navbar'
import './App.css'

function App() {
  // Combine static recipes with any custom drinks the user creates
  const [customDrinks, setCustomDrinks] = useState([])
  const [currentView, setCurrentView] = useState('list') // 'list' | 'details' | 'custom'
  const [selectedDrink, setSelectedDrink] = useState(null)

  const allDrinks = [...drinksData, ...customDrinks]

  const handleSelectDrink = (drink) => {
    setSelectedDrink(drink)
    setCurrentView('details')
  }

  const handleCreateDrink = (drink) => {
    setCustomDrinks((prev) => [...prev, drink])
    // After creation, show the drink details view
    setSelectedDrink(drink)
    setCurrentView('details')
  }

  const handleChangeView = (view) => {
    setCurrentView(view)
    setSelectedDrink(null)
  }

  return (
    <div className="app-container">
      <Navbar currentView={currentView} onChangeView={handleChangeView} />
      {currentView === 'list' && (
        <div className="list-view">
          <header className="hero-section">
            <div className="overlay">
              <h1>Objevte nové drinky</h1>
              <p>Prohlédněte si oblíbené recepty nebo si vytvořte svůj vlastní koktejl.</p>
            </div>
          </header>
          <DrinkList drinks={allDrinks} onSelect={handleSelectDrink} />
        </div>
      )}
      {currentView === 'details' && selectedDrink && (
        <DrinkDetails
          drink={selectedDrink}
          onBack={() => handleChangeView('list')}
        />
      )}
      {currentView === 'custom' && (
        <CustomDrinkForm onCreate={handleCreateDrink} />
      )}
    </div>
  )
}

export default App