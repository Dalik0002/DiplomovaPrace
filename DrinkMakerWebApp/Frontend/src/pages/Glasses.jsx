import { useEffect, useState } from 'react'
import GlassesList from '../components/GlassesList'
import { deleteGlasses } from '../services/glassesService'
import { useNavigate } from 'react-router-dom'
import './Glasses.css'

function Glasses() {
  const navigate = useNavigate()

  const clearGlasses = async () => {
    try {
      await deleteGlasses()
    } catch (err) {
      console.error("Chyba při mazání sklenic:", err)
    }
  }

  return (
    <div className="pages-centered-page">
      <button className="back-button" onClick={() => navigate('/')}>Zpět</button>
      <div className="centered-page">
        <h2>SKLENICE</h2>
        <GlassesList />
        <button className="delete-button" onClick={clearGlasses}>
          Vymazat všechny sklenice
        </button>
      </div>
    </div>
  )
}

export default Glasses
