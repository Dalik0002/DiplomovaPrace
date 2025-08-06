// src/App.jsx
import StartMenu from './pages/StartMenu'
import { DrinkProvider } from './state/DrinkContext'  // Cesta podle tebe

function App() {
  return (
    <DrinkProvider>
      <StartMenu />
    </DrinkProvider>
  )
}

export default App
