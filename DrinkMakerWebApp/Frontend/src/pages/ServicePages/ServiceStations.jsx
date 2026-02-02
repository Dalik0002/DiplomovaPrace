// src/pages/service/ServiceStations.jsx
import './service.css'
import { useEffect } from 'react'
import { useState } from 'react'
import {
  restartCarouselESP,
  calibrateLoadCell,
  disableStation,
  enableStation,
  updateCarouselESP,
  markBottleFilled,
} from '../../services/servicesService'

import { useInputData } from '../../hooks/useInputData'

function ServiceStations() {
  const [selected, setSelected] = useState(0)

  // čteme z backendu
  const {
    problemsByPos,
    positionDisabled,
    isLoading,
    error,
    refresh,
  } = useInputData()

  const posProblems = problemsByPos?.[selected] ?? {
    hx711Error: false,
    emptyBottle: false,
    disabled: false,
  }

  const isDisabled = !!positionDisabled?.[selected]
  
 /*useEffect(() => {
    console.group('[Stations][DEBUG] positionDisabled refresh')
    console.log('positionDisabled:', positionDisabled)
    positionDisabled?.forEach((val, idx) => {
      console.log(`  stanoviště ${idx + 1}:`, val)
    })
    console.groupEnd()
  }, [positionDisabled])*/

  const restartCarouselESPAtPosition = async (position) => {
    try {
      await restartCarouselESP(position)
    } catch (err) {
      console.error(`Chyba při restartu ESP na pozici ${position}:`, err)
    }
  }

  const calibrateLoadCellAtPosition = async (position) => {
    try {
      await calibrateLoadCell(position)
    } catch (err) {
      console.error(`Chyba při kalibraci tenzometru na pozici ${position}:`, err)
    }
  }

  const updateCarouselESPAtPosition = async (position) => {
    try {
      await updateCarouselESP(position)
    } catch (err) {
      console.error(`Chyba při aktualizaci ESP na pozici ${position}:`, err)
    }
  }

  const fillBottleAtPosition = async (position) => {
    try {
      await markBottleFilled(position)
    } catch (err) {
      console.error(`Chyba při označení doplnění láhve na pozici ${position}:`, err)
    }
  }

  const disableStationToggle = async (position) => {
    const next = !positionDisabled?.[position]

    try {
      if (next) await disableStation(position)
      else await enableStation(position)

      // po změně si stáhneme aktuální stav z backendu
      refresh()
    } catch (err) {
      console.error(`Chyba při změně stavu stanoviště ${position}:`, err)
      // klidně také refresh, ať se UI srovná i po chybě
      refresh()
    }
  }

  const describeProblems = (p) => {
    const list = []
    if (p.disabled) list.push('Stanoviště je zakázané')
    if (p.hx711Error) list.push('Chyba HX711 / tenzometr')
    if (p.emptyBottle) list.push('Prázdná láhev')
    return list
  }

  const countProblems = (p) => (p.disabled ? 1 : 0) + (p.hx711Error ? 1 : 0) + (p.emptyBottle ? 1 : 0)

  const selectedProblemList = describeProblems(posProblems)
  const selectedHasProblem = selectedProblemList.length > 0

  return (
    <div className="pages-centered-page">
      <div className="service-container">

        {/* TOP: 6 čtverečků */}
        <div className="stations-tabs" role="tablist" aria-label="Výběr stanoviště">
          {Array.from({ length: 6 }, (_, i) => {
            const active = i === selected
            const p = problemsByPos?.[i] ?? { hx711Error: false, emptyBottle: false, disabled: false }
            const hasProblem = p.disabled || p.hx711Error || p.emptyBottle
            const n = countProblems(p)
            const tooltip = hasProblem ? describeProblems(p).join(' | ') : 'Bez problému'

            return (
              <button
                key={i}
                type="button"
                role="tab"
                aria-selected={active}
                className={[
                  'stations-tab',
                  active ? 'is-active' : '',
                  hasProblem ? 'has-problem' : '',
                  p.disabled ? 'is-disabled' : '',
                ].join(' ')}
                onClick={() => setSelected(i)}
                title={`Stanoviště ${i + 1}: ${tooltip}`}
                disabled={isLoading}
              >
                {i + 1}

                {/* malý badge s počtem problémů */}
                {hasProblem && (
                  <span className="tab-badge" aria-hidden="true">
                    {n}
                  </span>
                )}
              </button>
            )
          })}
        </div>

        {error && (
          <div style={{ opacity: 0.8, marginBottom: 10 }}>
            Nepodařilo se načíst stav z backendu.
          </div>
        )}

        {/* 4 možnosti pro vybrané stanoviště */}
        <div className="service-container">
          <h2 className="service-container-title">Stanoviště {selected + 1}</h2>

          {/* ✅ KONKRÉTNÍ VÝPIS PROBLÉMŮ PRO VYBRANÉ STANOVIŠTĚ */}
          <div className={`station-status ${selectedHasProblem ? 'has-problem' : 'ok'}`}>
            {selectedHasProblem ? (
              <>
                <div className="station-status-title">⚠ Problémy na stanovišti:</div>
                <div className="station-status-list">
                  {selectedProblemList.map((t) => (
                    <div key={t} className="station-status-item">{t}</div>
                  ))}
                </div>
              </>
            ) : (
              <div className="station-status-title">✅ Stanoviště bez problému</div>
            )}
          </div>

          <div className="service-column">

            {/* 1. Zakázat / Povolit */}
            <button
              className={`service-btn ${isDisabled ? 'is-on' : ''}`}
              aria-pressed={isDisabled}
              onClick={() => disableStationToggle(selected)}
              type="button"
              disabled={isLoading}
            >
              {isDisabled ? 'Povolit stanoviště' : 'Zakázat stanoviště'}
            </button>

            {/* 2. Doplněno */}
            <button
              className="service-btn"
              onClick={() => fillBottleAtPosition(selected)}
              type="button"
              disabled={isLoading}
            >
              Doplněno
            </button>

            {/* 3. Restart */}
            <button
              className="service-btn"
              onClick={() => restartCarouselESPAtPosition(selected)}
              type="button"
              disabled={isLoading}
            >
              Restartovat
            </button>

            {/* 4. Kalibrace */}
            <button
              className="service-btn"
              onClick={() => calibrateLoadCellAtPosition(selected)}
              type="button"
              disabled={isLoading}
            >
              Kalibrovat
            </button>

            {/* 5. Aktualizace */}
            <button
              className="service-btn"
              onClick={() => updateCarouselESPAtPosition(selected)}
              type="button"
              disabled={isLoading}
            >
              Aktualizovat
            </button>

          </div>
        </div>

      </div>
    </div>
  )
}

export default ServiceStations