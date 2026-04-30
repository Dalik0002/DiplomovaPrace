import { BrowserRouter } from 'react-router-dom'
import AppRouter from './AppRouter'
import './App.css'
import './css/Interface.css'
import './css/Buttons.css'

function App() {
  return (
    <BrowserRouter>
      <div className="app-shell">
        <AppRouter />
      </div>
    </BrowserRouter>
  )
}

export default App