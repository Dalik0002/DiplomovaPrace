// src/pages/service/ServiceRemote.jsx
import './service.css'
import { useState, useEffect } from 'react'
import {
  releaseCarouselMotor,
  releasePlexiMotor,
  blockCarouselMotor,
  blockPlexiMotor,
  restartESP32,
  restartESPs,
  setValve,
  updateESP32,
  updateESPs,
  homeCarousel,
  moveCarousel,
  homePlexi,
  movePlexi
} from '../../services/servicesService'

import { useInputData, useInputDataFast } from '../../hooks/useInputData'

function ServiceRemote() {
  const [activeTab, setActiveTab] = useState('actions') // actions | valves | sensors

  const [valveOn, setValveOn] = useState(Array(6).fill(false))
  const [plexiReleased, setPlexiReleased] = useState(false)
  const [carouselReleased, setCarouselReleased] = useState(false)

  const [homingCarousel, setHomingCarousel] = useState(false)
  const [movingCarousel, setMovingCarousel] = useState(false)
  const [homingPlexi, setHomingPlexi] = useState(false)

  const [plexiHeight, setPlexiHeight] = useState(0) // 0..100
  const [movingPlexi, setMovingPlexi] = useState(false)

  const { tensometerValues = [] } = useInputDataFast()

  const restartMainUnit = async (e) => {
    e?.currentTarget?.blur()
    try { await restartESP32() }
    catch (err) { console.error('Chyba při restartu ESP32', err) }
  }

  const restartCarouselESPs = async (e) => {
    e?.currentTarget?.blur()
    try { await restartESPs() }
    catch (err) { console.error('Chyba při restartu ESPs:', err) }
  }

  const updateMainUnit = async (e) => {
    e?.currentTarget?.blur()
    try { await updateESP32() }
    catch (err) { console.error('Chyba při aktualizaci ESP32', err) }
  }

  const updateCarouselESPs = async (e) => {
    e?.currentTarget?.blur()
    try { await updateESPs() }
    catch (err) { console.error('Chyba při aktualizaci ESPs:', err) }
  }

  const homeCarouselAction = async (e) => {
    e?.currentTarget?.blur()
    if (homingCarousel) return
    try {
      setHomingCarousel(true)
      await homeCarousel()
    } catch (err) {
      console.error('Chyba při HOME karusel', err)
    } finally {
      setHomingCarousel(false)
    }
  }

  const moveCarouselAction = async (e) => {
    e?.currentTarget?.blur()
    if (movingCarousel) return
    try {
      setMovingCarousel(true)
      await moveCarousel()
    } catch (err) {
      console.error('Chyba při MOVE karusel', err)
    } finally {
      setMovingCarousel(false)
    }
  }

  const homePlexiAction = async (e) => {
    e?.currentTarget?.blur()
    if (homingPlexi) return
    try {
      setHomingPlexi(true)
      await homePlexi()
    } catch (err) {
      console.error('Chyba při HOME patro', err)
    } finally {
      setHomingPlexi(false)
    }
  }

  const sendMovePlexi = async (e) => {
    e?.currentTarget?.blur()
    if (movingPlexi) return
    try {
      setMovingPlexi(true)
      // očekávám, že servicesService.movePlexi(height) volá POST /service/movePlexi s {height}
      await movePlexi(plexiHeight)
    } catch (err) {
      console.error('Chyba při posunu pojízdného patra:', err)
    } finally {
      setMovingPlexi(false)
    }
  }

  const toggleValve = async (i) => {
    const next = !valveOn[i]
    setValveOn(prev => { const cp = [...prev]; cp[i] = next; return cp })
    try {
      await setValve(i, next)
    } catch (err) {
      setValveOn(prev => { const cp = [...prev]; cp[i] = !next; return cp })
      console.error(`Chyba při ${next ? 'otevření' : 'zavření'} ventilu ${i}:`, err)
    }
  }

  const togglePlexi = async () => {
    const next = !plexiReleased
    setPlexiReleased(next)
    try {
      if (next) await releasePlexiMotor()
      else await blockPlexiMotor()
    } catch (err) {
      setPlexiReleased(!next)
      console.error('Chyba při změně stavu patra:', err)
    }
  }

  const toggleCarousel = async () => {
    const next = !carouselReleased
    setCarouselReleased(next)
    try {
      if (next) await releaseCarouselMotor()
      else await blockCarouselMotor()
    } catch (err) {
      setCarouselReleased(!next)
      console.error('Chyba při změně stavu karuselu:', err)
    }
  }

  return (
    <div className="pages-centered-page">
      <div className="service-container service-remote">

        {/* Minimal header tabs */}
        <div className="service-tabs" role="tablist" aria-label="Servis sekce">
          <button
            type="button"
            className={`service-tab ${activeTab === 'actions' ? 'is-active' : ''}`}
            onClick={() => setActiveTab('actions')}
          >
            AKCE
          </button>
          <button
            type="button"
            className={`service-tab ${activeTab === 'valves' ? 'is-active' : ''}`}
            onClick={() => setActiveTab('valves')}
          >
            VENTILY
          </button>
          <button
            type="button"
            className={`service-tab ${activeTab === 'sensors' ? 'is-active' : ''}`}
            onClick={() => setActiveTab('sensors')}
          >
            HMOTNOST
          </button>
        </div>

        {/* CONTENT */}
        {activeTab === 'actions' && (
          <div className="service-card">
            <h2 className="service-subtitle">RESTART</h2>
            <div className="mini-grid">
              <button className="service-btn" onClick={restartMainUnit} type="button">
                HLAVNÍ JEDNOTKA
              </button>
              <button className="service-btn" onClick={restartCarouselESPs} type="button">
                JEDNOTKY NA KARUSELU
              </button>
            </div>

            <div className="divider" />

            <h2 className="service-subtitle">KARUSEL</h2>
            <div className="mini-grid">
              <button
                className="service-btn"
                onClick={homeCarouselAction}
                type="button"
                disabled={homingCarousel}
                title={homingCarousel ? 'Probíhá homing…' : 'Najet na referenční polohu karuselu'}
              >
                {homingCarousel ? 'POSUN KARUSELU…' : 'KARUSEL DO ZÁKLADNÍ POLOHY'}
              </button>

              <button
                className="service-btn"
                onClick={moveCarouselAction}
                type="button"
                disabled={movingCarousel}
                title={movingCarousel ? 'Probíhá pohyb…' : 'Pootočení karuselu'}
              >
                {movingCarousel ? 'OTÁČENÍ KARUSELU…' : 'POOTOČIT KARUSEL'}
              </button>
            </div>

            <div className="divider" />

            <h2 className="service-subtitle">POJÍZDNÉ PATRO</h2>
            <div className="service-card-inner" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div className="mini-grid">
                <button
                  className="service-btn"
                  onClick={homePlexiAction}
                  type="button"
                  disabled={homingPlexi}
                  title={homingPlexi ? 'Probíhá homing…' : 'Najet na referenční polohu patra'}
                >
                  {homingPlexi ? 'POHYB PATRA…' : 'PATRO DO ZÁKLADNÍ POLOHY'}
                </button>

                <button
                  className="service-btn"
                  type="button"
                  onClick={sendMovePlexi}
                  disabled={movingPlexi}
                  title={movingPlexi ? 'Probíhá posun…' : 'Odeslat výšku na zařízení'}
                >
                  {movingPlexi ? 'POSÍLÁM…' : 'NASTAVIT VÝŠKU'}
                </button>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <input
                  type="range"
                  min={0}
                  max={100}
                  step={10}
                  value={plexiHeight}
                  onChange={(e) => setPlexiHeight(Number(e.target.value))}
                  style={{ flex: 1, cursor: 'pointer' }}
                  aria-label="Výška pojízdného patra v procentech"
                />
                <div style={{ minWidth: 48, textAlign: 'right', fontVariantNumeric: 'tabular-nums', fontWeight: 'bold' }}>
                  {plexiHeight}%
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Sekce VENTILY */}
        {activeTab === 'valves' && (
          <div className="service-card">
            <h2 className="service-container-title">VENTILY</h2>
            <div className="station-circle-container">
              <div className="station-circle-track" /> {/* Pomyslný kruh na pozadí */}
              {Array.from({ length: 6 }).map((_, i) => (
                <button
                  key={i}
                  className={`circle-node ${valveOn[i] ? 'is-on' : ''}`}
                  style={{ '--index': i }}
                  onClick={() => toggleValve(i)}
                  type="button"
                >
                  <span className="node-label">{i + 1}</span>
                  <small className="node-status">{valveOn[i] ? 'ON' : 'OFF'}</small>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Sekce TENZOMETRY */}
        {activeTab === 'sensors' && (
          <div className="service-card">
            <h2 className="service-container-title">MĚŘENÍ HMOTNOSTI</h2>
            <div className="station-circle-container">
              <div className="station-circle-track" />
              {Array.from({ length: 6 }).map((_, i) => (
                <div className="circle-node sensor" key={i} style={{ '--index': i }}>
                  <span className="node-label">{i + 1}</span>
                  <span className="node-value">
                    {tensometerValues?.[i] ?? '—'}{tensometerValues?.[i] != null ? ' g' : ''}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

      </div>
    </div>
  )
}

export default ServiceRemote
