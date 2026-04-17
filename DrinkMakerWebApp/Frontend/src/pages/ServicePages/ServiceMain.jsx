// src/pages/service/ServiceMain.jsx
import { useNavigate, Outlet, useLocation } from 'react-router-dom'
import { useEffect, useRef } from 'react'

import { heartbeatServiceLock, releaseServiceLock } from '../../services/lockService'
import { resetService } from '../../services/stateService'
import { useInputData } from '../../hooks/useInputData'
import { useStateStatus } from '../../hooks/useStateData'
import './service.css'

function ServiceMain() {
  const navigate = useNavigate()
  const location = useLocation() // Pro zjištění, kde zrovna jsme

  const {
    totalProblemsCount = 0,
    error: inputErr,
    isLoading: inputLoading,
  } = useInputData()

  const {
    isService,
    error: stateErr,
    isLoading: stateLoading,
    refresh: refreshState,
  } = useStateStatus()

  const notServiceStreakRef = useRef(0)

  // Zjistíme aktivní sekci podle URL adresy
  const isStationsActive = location.pathname.includes('serviceStations')

  useEffect(() => {
    if (stateLoading) return
    if (stateErr) return
    if (isService) {
      notServiceStreakRef.current = 0
      return
    }

    notServiceStreakRef.current += 1

    if (notServiceStreakRef.current < 1) return

    const kick = async () => {
      try { await releaseServiceLock() } catch (e) { console.error('Release při kicku selhal', e) }
      try { await resetService() } catch (e) { console.error('Reset service modu při kicku selhal', e) }
      navigate('/')
    }

    kick()
  }, [isService, stateLoading, stateErr, navigate])


  useEffect(() => {
    let alive = true

    const tick = async () => {
      try {
        await heartbeatServiceLock()
        refreshState()
      } catch (err) {
        console.error("Heartbeat selhal", err)
        try {
          await releaseServiceLock()
        } catch (e) {
          console.error("Release po heartbeat chybě selhal", e)
        }
        if (alive){
          try {
            await resetService()
          } catch (e) {
            console.error("Reset service modu selhal", e)
          }
          navigate('/')
        } 
      }
    }

    tick()
    const interval = setInterval(tick, 2000)

    return () => {
      alive = false
      clearInterval(interval)
    }
  }, [navigate, refreshState])


  const onBackClick = async () => {
    try {
      await releaseServiceLock()
    } catch (e) {
      console.error("Release při návratu selhal", e)
    }
    try {
      await resetService()
    } catch (e) {
      console.error("Reset service modu selhal", e)
    }
    navigate('/')
  }

  const showStationsBadge = !isStationsActive && !inputLoading && !inputErr && totalProblemsCount > 0

  return (
    <div className="pages-centered-page">
      <div className="service-page-frame">
        <button className="back-button" onClick={onBackClick}>Zpět</button>
        <div className="service-top-nav">
          <button
            className={`service-nav-btn ${!isStationsActive ? 'is-active' : ''}`}
            onClick={() => navigate('/service/serviceRemote')}
          >
            Servisní obrazovka
          </button>
          
          <button
            className={`service-nav-btn ${isStationsActive ? 'is-active' : ''}`}
            onClick={() => navigate('/service/serviceStations')}
          >
            Nádoby & Stanoviště
            {showStationsBadge && (
              <span
                className="service-badge"
                aria-label={`Počet problémů: ${totalProblemsCount}`}
                title={`Počet problémů: ${totalProblemsCount}`}
              >
                ! {totalProblemsCount}
              </span>
            )}
          </button>
        </div>

        <div style={{ width: '100%' }}>
          <Outlet />
        </div>
      </div>
    </div>
  )
}

export default ServiceMain