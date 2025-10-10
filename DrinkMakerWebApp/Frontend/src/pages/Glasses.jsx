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
    <div className="centered-page">
      <button className="back-button" onClick={() => navigate('/')}>Zpět</button>
      <h1>SKLENICE</h1>
      <GlassesList />
      <button className="delete-button" onClick={clearGlasses}>
        Vymazat všechny sklenice
      </button>
    </div>
  )
}

export default Glasses
