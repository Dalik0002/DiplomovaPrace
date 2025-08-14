// src/App.jsx
import { BrowserRouter } from 'react-router-dom'
import { DrinkProvider } from './state/DrinkContext'
import AppRouter from './AppRouter'

function App() {
  return (
    <DrinkProvider>
      <BrowserRouter>
        <AppRouter />
      </BrowserRouter>
    </DrinkProvider>
  )
}

export default App