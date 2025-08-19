import './StateConteiner.css'
import { useEffect, useState } from 'react'
import { getState } from '../services/stateService'

function StateConteiner() {
  const [state, setState] = useState(null)
  const [error, setError] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchState = async () => {
      try {
        const result = await getState()
        setState(result)
      } catch (err) {
        console.error("Chyba při načítání stavu:", err)
        setError("Chyba při načítání stavu")
      } finally {
        setLoading(false)
      }
    }
    fetchState()
  }, [])
 
  return (
    <div className="state-container">
      <h2 className="state-title">Stav</h2>
      {(loading ? (
        <p>Načítání...</p>
      ) : error ? (
        <p className="error-message">{error}</p>
      ) : (
        <div className="state-info">
          <p>{state.message}</p>
        </div>
      ))}
    </div>
  )
}

export default StateConteiner
