// src/App.jsx
import { Routes, Route, Link } from 'react-router-dom'
import Home from './pages/Home'
import Setup from './pages/Setup'
import './App.css'

function App() {
  return (
    <div className="app-container">
      <nav className="nav-bar">
        <Link to="/">Domů</Link>
        <Link to="/setup">Setup</Link>
      </nav>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/setup" element={<Setup />} />
      </Routes>
    </div>
  )
}

export default App
