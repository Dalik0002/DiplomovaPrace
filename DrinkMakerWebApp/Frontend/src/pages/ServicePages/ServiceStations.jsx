// src/pages/service/ServiceStations.jsx
import './service.css'
import { useState } from 'react'
import {
  restartCarouselESP,
  calibrateLoadCell,
  disableStation,
  enableStation,
  disableStationSlot,
  enableStationSlot,
  markBottleFilled,
} from '../../services/servicesService'

import { useInputData } from '../../hooks/useInputData'

const BOTTLE_LABELS = ['A', 'B', 'C', 'D', 'E', 'F']

function ServiceStations() {
  const [activeTab, setActiveTab] = useState('bottles')
  const [selectedBottle, setSelectedBottle] = useState(0)
  const [selectedStation, setSelectedStation] = useState(0)

  const {
    problemsByPos,
    positionDisabled,
    stationDisabled,
    isLoading,
    error,
    refresh,
  } = useInputData()

  const bottleProblems = problemsByPos?.[selectedBottle] ?? { hx711Error: false, emptyBottle: false, disabled: false }
  const isBottleDisabled = !!positionDisabled?.[selectedBottle]

  const stationProblems = problemsByPos?.[selectedStation] ?? { hx711Error: false, emptyBottle: false, disabled: false }
  const isStationDisabled = !!stationDisabled?.[selectedStation]

  const describeBottleProblems = (p) => {
    const list = []
    if (p.disabled) list.push('Nádoba zakázána')
    if (p.emptyBottle) list.push('Prázdná nádoba')
    return list
  }

  const describeStationProblems = (p) => {
    const list = []
    if (p.stationDisabled) list.push('Stanoviště zakázáno')
    if (p.hx711Error) list.push('Chyba HX711 / tenzometr')
    return list
  }

  const countBottleProblems = (p) => (p.disabled ? 1 : 0) + (p.emptyBottle ? 1 : 0)
  const countStationProblems = (p) => (p.stationDisabled ? 1 : 0) + (p.hx711Error ? 1 : 0)

  const disableBottleToggle = async (position) => {
    const next = !positionDisabled?.[position]
    try {
      if (next) await disableStation(position)
      else await enableStation(position)
      refresh()
    } catch (err) {
      console.error(`Chyba při změně stavu nádoby ${position}:`, err)
      refresh()
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
    const next = !stationDisabled?.[position]
    try {
      if (next) await disableStationSlot(position)
      else await enableStationSlot(position)
      refresh()
    } catch (err) {
      console.error(`Chyba při změně stavu stanoviště ${position}:`, err)
      refresh()
    }
  }

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

  const bottleProblemList = describeBottleProblems(bottleProblems)
  const bottleHasProblem = bottleProblemList.length > 0

  const stationProblemList = describeStationProblems(stationProblems)
  const stationHasProblem = stationProblemList.length > 0

  const totalBottleProblems = Array.from({ length: 6 }, (_, i) => problemsByPos?.[i]).reduce(
    (sum, p) => sum + (p?.emptyBottle ? 1 : 0) + (p?.disabled ? 1 : 0), 0
  )
  const totalStationProblems = Array.from({ length: 6 }, (_, i) => problemsByPos?.[i]).reduce(
    (sum, p) => sum + (p?.stationDisabled ? 1 : 0) + (p?.hx711Error ? 1 : 0), 0
  )

  return (
    <div className="pages-centered-page">
      <div className="service-container">

        {error && (
          <div style={{ opacity: 0.8, marginBottom: 10 }}>
            Nepodařilo se načíst stav z backendu.
          </div>
        )}

        <div className="service-top-nav" role="tablist">
          <button
            type="button"
            role="tab"
            aria-selected={activeTab === 'bottles'}
            className={`service-nav-btn ${activeTab === 'bottles' ? 'is-active' : ''}`}
            onClick={() => setActiveTab('bottles')}
          >
            Nádoby
            {totalBottleProblems > 0 && (
              <span className="service-badge">{totalBottleProblems}</span>
            )}
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={activeTab === 'stations'}
            className={`service-nav-btn ${activeTab === 'stations' ? 'is-active' : ''}`}
            onClick={() => setActiveTab('stations')}
          >
            Stanoviště
            {totalStationProblems > 0 && (
              <span className="service-badge">{totalStationProblems}</span>
            )}
          </button>
        </div>

        {/* ── NÁDOBY ── */}
        {activeTab === 'bottles' && <div className="service-container">
          <h2 className="service-container-title">Nádoby</h2>

          <div className="stations-tabs" role="tablist" aria-label="Výběr nádoby">
            {BOTTLE_LABELS.map((label, i) => {
              const active = i === selectedBottle
              const p = problemsByPos?.[i] ?? { hx711Error: false, emptyBottle: false, disabled: false }
              const hasProblem = p.disabled || p.emptyBottle
              const n = countBottleProblems(p)
              const tooltip = hasProblem ? describeBottleProblems(p).join(' | ') : 'Bez problému'

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
                  onClick={() => setSelectedBottle(i)}
                  title={`Nádoba ${label}: ${tooltip}`}
                  disabled={isLoading}
                >
                  {label}
                  {hasProblem && (
                    <span className="tab-badge" aria-hidden="true">{n}</span>
                  )}
                </button>
              )
            })}
          </div>

          <div className={`station-status ${bottleHasProblem ? 'has-problem' : 'ok'}`}>
            {bottleHasProblem ? (
              <>
                <div className="station-status-title">⚠ Problémy na nádobě {BOTTLE_LABELS[selectedBottle]}:</div>
                <div className="station-status-list">
                  {bottleProblemList.map((t) => (
                    <div key={t} className="station-status-item">{t}</div>
                  ))}
                </div>
              </>
            ) : (
              <div className="station-status-title">✅ Nádoba {BOTTLE_LABELS[selectedBottle]} bez problému</div>
            )}
          </div>

          <div className="service-column">
            <button
              className={`service-btn ${isBottleDisabled ? 'is-on' : ''}`}
              aria-pressed={isBottleDisabled}
              onClick={() => disableBottleToggle(selectedBottle)}
              type="button"
              disabled={isLoading}
            >
              {isBottleDisabled ? 'Povolit nádobu' : 'Zakázat nádobu'}
            </button>

            <button
              className={`service-btn ${bottleProblems.emptyBottle ? 'is-on' : ''}`}
              onClick={() => fillBottleAtPosition(selectedBottle)}
              type="button"
              disabled={isLoading || !bottleProblems.emptyBottle}
            >
              {bottleProblems.emptyBottle ? 'Doplnit nádobu' : 'Doplněno'}
            </button>
          </div>
        </div>}

        {/* ── STANOVIŠTĚ ── */}
        {activeTab === 'stations' && <div className="service-container">
          <h2 className="service-container-title">Stanoviště</h2>

          <div className="stations-tabs" role="tablist" aria-label="Výběr stanoviště">
            {Array.from({ length: 6 }, (_, i) => {
              const active = i === selectedStation
              const p = problemsByPos?.[i] ?? { hx711Error: false, emptyBottle: false, disabled: false }
              const hasProblem = p.hx711Error || p.stationDisabled
              const n = countStationProblems(p)
              const tooltip = hasProblem ? describeStationProblems(p).join(' | ') : 'Bez problému'

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
                    p.stationDisabled ? 'is-disabled' : '',
                  ].join(' ')}
                  onClick={() => setSelectedStation(i)}
                  title={`Stanoviště ${i + 1}: ${tooltip}`}
                  disabled={isLoading}
                >
                  {i + 1}
                  {hasProblem && <span className="tab-badge" aria-hidden="true">{n}</span>}
                </button>
              )
            })}
          </div>

          <div className={`station-status ${stationHasProblem ? 'has-problem' : 'ok'}`}>
            {stationHasProblem ? (
              <>
                <div className="station-status-title">⚠ Problémy na stanovišti {selectedStation + 1}:</div>
                <div className="station-status-list">
                  {stationProblemList.map((t) => (
                    <div key={t} className="station-status-item">{t}</div>
                  ))}
                </div>
              </>
            ) : (
              <div className="station-status-title">✅ Stanoviště {selectedStation + 1} bez problému</div>
            )}
          </div>

          <div className="service-column">
            <button
              className={`service-btn ${isStationDisabled ? 'is-on' : ''}`}
              aria-pressed={isStationDisabled}
              onClick={() => disableStationToggle(selectedStation)}
              type="button"
              disabled={isLoading}
            >
              {isStationDisabled ? 'Povolit stanoviště' : 'Zakázat stanoviště'}
            </button>

            <button
              className="service-btn"
              onClick={() => restartCarouselESPAtPosition(selectedStation)}
              type="button"
              disabled={isLoading}
            >
              Restartovat
            </button>

            <button
              className="service-btn"
              onClick={() => calibrateLoadCellAtPosition(selectedStation)}
              type="button"
              disabled={isLoading}
            >
              Kalibrovat
            </button>
          </div>
        </div>}

      </div>
    </div>
  )
}

export default ServiceStations
