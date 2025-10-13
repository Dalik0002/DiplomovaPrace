// src/pages/service/ServiceMainCom.jsx
import './service.css'
import { useState, useRef } from 'react'
import {
  releaseCarouselMotor,
  releasePlexiMotor,
  blockCarouselMotor,
  blockPlexiMotor,
  restartESP32,
  restartESPs,
  setValve
} from '../../services/servicesService'

function ServiceMainCom() {
  const [valveOn, setValveOn] = useState(Array(6).fill(false))
  const [plexiReleased, setPlexiReleased] = useState(false)
  const [carouselReleased, setCarouselReleased] = useState(false)

  const restartMainUnit = async () => {
    try { await restartESP32() }
    catch (err) { console.error('Chyba při restartu ESP32', err) }
  }

  const restartCarouselESPs = async () => {
    try { await restartESPs() }
    catch (err) { console.error('Chyba při restartu ESPs:', err) }
  }

    // ----- Ventily: jednoduchý toggle na klik -----
  const toggleValve = async (i) => {
    const next = !valveOn[i]
    setValveOn(prev => { const cp = [...prev]; cp[i] = next; return cp })
    try {
      await setValve(i, next) // true = otevřít, false = zavřít
    } catch (err) {
      // revert při chybě
      setValveOn(prev => { const cp = [...prev]; cp[i] = !next; return cp })
      console.error(`Chyba při ${next ? 'otevření' : 'zavření'} ventilu ${i}:`, err)
    }
  }

  // -------- Motory: toggle --------
  const togglePlexi = async () => {
    const next = !plexiReleased
    setPlexiReleased(next)
    try {
      if (next) await releasePlexiMotor()
      else      await blockPlexiMotor()
    } catch (err) {
      setPlexiReleased(!next) // revert
      console.error('Chyba při změně stavu patra:', err)
    }
  }

  const toggleCarousel = async () => {
    const next = !carouselReleased
    setCarouselReleased(next)
    try {
      if (next) await releaseCarouselMotor()
      else      await blockCarouselMotor()
    } catch (err) {
      setCarouselReleased(!next) // revert
      console.error('Chyba při změně stavu karuselu:', err)
    }
  }

  return (
    <div className="pages-centered-page">
      <div className="service-container">
        <div className="service-row">
          {/* RESET card */}
          <div className="service-container">
            <h2 className="service-container-title">RESTARTOVAT</h2>
            <div className="service-column">
              <button className="service-btn" onClick={restartMainUnit}>
                RESTARTOVAT HLAVNÍ JEDNOTKU
              </button>
              <button className="service-btn" onClick={restartCarouselESPs}>
                RESTARTOVAT JEDNOTKY NA KARUSELU
              </button>
            </div>
          </div>

          {/* MOTORY card (toggle) */}
          <div className="service-container">
            <h2 className="service-container-title">MOTORY</h2>
            <div className="service-column">
              <button
                className={`service-btn ${plexiReleased ? 'is-on' : ''}`}
                aria-pressed={plexiReleased}
                onClick={togglePlexi}
                type="button"
              >
                {plexiReleased ? 'ZAMKNOUT PATRO' : 'UVOLNIT PATRO'}
              </button>

              <button
                className={`service-btn ${carouselReleased ? 'is-on' : ''}`}
                aria-pressed={carouselReleased}
                onClick={toggleCarousel}
                type="button"
              >
                {carouselReleased ? 'ZAMKNOUT KARUSEL' : 'UVOLNIT KARUSEL'}
              </button>
            </div>
          </div>
        </div>

        {/* ČIŠTĚNÍ card (toggle) */}
        <div className="service-container">
          <h2 className="service-container-title">ČIŠTĚNÍ</h2>
          <div className="clean-grid">
            {Array.from({ length: 6 }).map((_, i) => (
              <div className="clean-cell" key={i}>
                <div className="clean-title">POZICE {i + 1}</div>
                <button
                  className={`service-btn ${valveOn[i] ? 'is-on' : ''}`}
                  aria-pressed={valveOn[i]}
                  onClick={() => toggleValve(i)}
                  type="button"
                >
                  {valveOn[i] ? 'ZAVŘÍT VENTIL' : 'OTEVŘÍ VENTIL'}
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

export default ServiceMainCom
