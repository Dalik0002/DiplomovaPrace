import { useNavigate } from 'react-router-dom'
import { useEffect, useState, useRef, useMemo, useCallback } from 'react'

import { useStateStatus } from '../hooks/useStateData'
import { useServiceStatus } from '../hooks/useServiceStatus'
import { useInputData } from '../hooks/useInputData'
import { useGlasses } from '../hooks/useGlassesData'

import { setService, setStop, resetStop } from '../services/stateService'
import { acquireServiceLock, releaseServiceLock } from '../services/lockService'
import { deleteGlass } from '../services/glassesService'

import './DashBoard.css'

function Dashboard() {
  const navigate = useNavigate()

  const {
    data: state,
    isLoading: l_state,
    error: err_state,
    refresh: refreshState,
    isStandBy,
    isService,
    isStop,
    isNone,
  } = useStateStatus()

  const {
    error: err_service,
    isBusy,
    refresh: refreshService,
  } = useServiceStatus()

  const { totalProblemsCount, processPouringStarted } = useInputData()

  const {
    data: glasses = [],
    refresh: refreshGlasses,
  } = useGlasses()

  const [pendingServiceNav, setPendingServiceNav] = useState(false)
  const serviceTimeoutRef = useRef(null)

  const [selectedStation, setSelectedStation] = useState(null)
  const [deleting, setDeleting] = useState(false)

  const [isStopModalOpen, setIsStopModalOpen] = useState(false)
  const [ackChecked, setAckChecked] = useState(false)
  const [submittingStop, setSubmittingStop] = useState(false)

  useEffect(() => {
    if (processPouringStarted) {
      navigate('/pouring')
    }
  }, [processPouringStarted, navigate])

  useEffect(() => {
    if (pendingServiceNav && isService) {
      if (serviceTimeoutRef.current) {
        clearTimeout(serviceTimeoutRef.current)
        serviceTimeoutRef.current = null
      }

      setPendingServiceNav(false)
      navigate('/service/serviceRemote')
    }
  }, [pendingServiceNav, isService, navigate])

  useEffect(() => {
    return () => {
      if (serviceTimeoutRef.current) {
        clearTimeout(serviceTimeoutRef.current)
        serviceTimeoutRef.current = null
      }
    }
  }, [])

  const handleServiceClick = async () => {
    if (pendingServiceNav) return

    try {
      const res = await acquireServiceLock()

      if (res.ok) {
        try {
          await setService()
        } catch (e) {
          console.error('Set service modu selhal', e)
          try { await releaseServiceLock() } catch {}
          refreshService()
          alert('Nepodařilo se přepnout do SERVICE.')
          return
        }

        setPendingServiceNav(true)
        refreshState()

        if (serviceTimeoutRef.current) clearTimeout(serviceTimeoutRef.current)

        serviceTimeoutRef.current = setTimeout(async () => {
          serviceTimeoutRef.current = null
          setPendingServiceNav(false)
          refreshState()

          try { await releaseServiceLock() } catch {}
          refreshService()

          alert('Nepodařilo se přepnout do SERVICE (timeout). Zkuste to prosím znovu.')
        }, 10000)
      } else {
        alert('Service je právě obsazený. Zkuste to později.')
        refreshService()
      }
    } catch (err) {
      console.error(err)
      alert('Nepodařilo se ověřit lock servisu. Zkuste to později.')
      refreshService()
    }
  }

  const serviceLabel = err_service
    ? '⚙️ (Nedostupné)'
    : pendingServiceNav
      ? '⚙️ (Přepínám...)'
      : (isBusy ? '⚙️ (Obsazeno)' : '⚙️ Servis')

  const serviceDisabled = !!err_service || pendingServiceNav || (isBusy && !pendingServiceNav)

  const stations = useMemo(() => {
    const arr = Array.from({ length: 6 }, (_, i) => ({
      position: i,
      occupied: false,
      glass: null,
      items: [],
    }))

    glasses.forEach((g, index) => {
      if (!g) return

      const glassData = g?.glass ?? g
      const posRaw = g?.position ?? g?.glass_position ?? g?.slot ?? index
      const pos = Number(posRaw)

      if (!Number.isInteger(pos) || pos < 0 || pos > 5) return

      const ingredients = Array.isArray(glassData?.ingredients) ? glassData.ingredients : []
      const volumes = Array.isArray(glassData?.volumes) ? glassData.volumes : []

      const items = ingredients
        .map((ingredient, idx) => ({
          ingredient: String(ingredient || '').trim(),
          volume: Number(volumes[idx]) || 0,
        }))
        .filter((it) => it.ingredient !== '')

      arr[pos] = {
        position: pos,
        occupied: !!String(glassData?.name || '').trim() || items.length > 0,
        glass: glassData,
        items,
      }
    })

    return arr
  }, [glasses])

  const handleStationClick = (station) => {
    if (!station.occupied) {
      navigate('/newDrink', {
        state: { preselectedPosition: station.position },
      })
      return
    }

    setSelectedStation(station)
  }

  const closeStationModal = () => {
    if (deleting) return
    setSelectedStation(null)
  }

  const handleDeleteStation = async () => {
    if (!selectedStation) return

    try {
      setDeleting(true)
      await deleteGlass(selectedStation.position)
      await refreshGlasses()
      setSelectedStation(null)
    } catch (err) {
      console.error(err)
      alert('Nepodařilo se odebrat drink ze stanoviště.')
    } finally {
      setDeleting(false)
    }
  }

  const openStopConfirm = async () => {
    if (selectedStation) return

    try {
      if (!isStop) {
        await setStop()
      }
      setIsStopModalOpen(true)
    } catch (err) {
      console.error(err)
    }
  }

  const closeStopConfirm = () => {
    if (!submittingStop) {
      setIsStopModalOpen(false)
      setAckChecked(false)
    }
  }

  const sendResetStop = useCallback(async () => {
    try {
      setSubmittingStop(true)
      await resetStop()
    } catch (err) {
      console.error(err)
      alert('Nepodařilo se potvrdit STOP.')
    } finally {
      setSubmittingStop(false)
      setIsStopModalOpen(false)
      setAckChecked(false)
      refreshState()
    }
  }, [refreshState])

  const getDashboardStateClass = (value) => {
    switch (value) {
      case 'STAND BY':
        return 'dashboard-state-standby'
      case 'STOP':
        return 'dashboard-state-stop'
      case 'CHECKING':
        return 'dashboard-state-checking'
      case 'POURING':
        return 'dashboard-state-pouring'
      case 'SERVICE':
        return 'dashboard-state-service'
      case 'UPDATING':
        return 'dashboard-state-updating'
      case 'PARTY':
        return 'dashboard-state-party'
      default:
        return 'dashboard-state-unknown'
    }
  }

  const cardStateClass = isNone
    ? 'dashboard-state-error'
    : getDashboardStateClass(state?.data)

  return (
    <div className="dashboard-container">
      <div className="dashboard-shell">
        <div className="top-bar">
          <h1 className="title">DrinkMaker</h1>

          <div className="nav-buttons">
            <button onClick={() => navigate('/bottles')}>
              📦 Konfigurace lahví
            </button>

            <button onClick={handleServiceClick} disabled={serviceDisabled}>
              {serviceLabel}
              {!!totalProblemsCount && !err_service && !pendingServiceNav && (
                <span
                  className="service-badge"
                  aria-label={`Počet problémů: ${totalProblemsCount}`}
                >
                  ! {totalProblemsCount}
                </span>
              )}
            </button>
          </div>
        </div>

        <div className={`dashboard-circle-card ${cardStateClass}`}>
          <div className={`dashboard-state-strip ${cardStateClass}`}>
            {l_state ? (
              <p>Stahování...</p>
            ) : err_state ? (
              <p style={{ color: 'red' }}>Chyba při získávání dat.</p>
            ) : isNone ? (
              <p>ZAŘÍZENÍ NEDOSTUPNÉ</p>
            ) : (
              <p>{state?.data}</p>
            )}
          </div>

          <div className="dashboard-circle-instruction">
            Kliknutím na stanoviště si navolíte nápoj
          </div>

          <div className="dashboard-station-circle-container">
            <div className="dashboard-station-circle-track" />

            {stations.map((station, i) => (
              <button
                key={station.position}
                className={[
                  'dashboard-circle-node',
                  station.occupied ? 'is-filled' : '',
                ].join(' ')}
                style={{ '--index': i }}
                onClick={() => handleStationClick(station)}
                type="button"
                title={
                  station.occupied
                    ? `Stanoviště ${station.position + 1}`
                    : `Přidat nápoj na stanoviště ${station.position + 1}`
                }
              >
                <span className="dashboard-node-label">{station.position + 1}</span>
              </button>
            ))}

            <div className="dashboard-circle-center">
              <button
                className="dashboard-stop-button"
                onClick={openStopConfirm}
                type="button"
              >
                {isStop ? 'KVITACE STOP' : 'STOP'}
              </button>
            </div>
          </div>

          <div className="dashboard-start-wrap">
            <button
              className="start-button"
              disabled={!isStandBy}
              onClick={() => navigate('/orderReview')}
            >
              ZAHÁJIT NALÉVÁNÍ
            </button>
          </div>
        </div>
      </div>

      {selectedStation && (
        <div
          className="station-modal-backdrop"
          onClick={closeStationModal}
          role="dialog"
          aria-modal="true"
        >
          <div
            className="station-modal"
            onClick={(e) => e.stopPropagation()}
          >
            <h2>Stanoviště {selectedStation.position + 1}</h2>

            <div className="station-modal-list">
              {selectedStation.items.length > 0 ? (
                selectedStation.items.map((item, idx) => (
                  <p key={idx} className="station-modal-row">
                    {item.ingredient} — {item.volume} ml
                  </p>
                ))
              ) : (
                <p className="station-modal-row">Bez ingrediencí</p>
              )}
            </div>

            <div className="station-modal-actions">
              <button
                className="station-delete-btn"
                onClick={handleDeleteStation}
                disabled={deleting}
              >
                {deleting ? 'Odebírám…' : '🗑 Odebrat'}
              </button>

              <button
                className="station-close-btn"
                onClick={closeStationModal}
                disabled={deleting}
              >
                Zavřít
              </button>
            </div>
          </div>
        </div>
      )}

      {isStopModalOpen && (
        <div
          className="stop-modal-backdrop"
          onClick={closeStopConfirm}
          role="dialog"
          aria-modal="true"
        >
          <div className="stop-modal" onClick={(e) => e.stopPropagation()}>
            <h3>Zařízení v režimu STOP</h3>
            <p>
              Odstraňte veškeré závady a důkladně zkontrolujte zařízení před
              opětovným uvedením do normálního chodu.
            </p>

            <label className="ack-row">
              <input
                type="checkbox"
                checked={ackChecked}
                onChange={(e) => setAckChecked(e.target.checked)}
              />
              <span>Potvrzuji, že zařízení je připraveno.</span>
            </label>

            <div className="stop-modal-actions">
              <button
                className="btn-danger"
                onClick={sendResetStop}
                disabled={!ackChecked || submittingStop}
              >
                {submittingStop ? 'Odesílám…' : 'Potvrdit'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default Dashboard