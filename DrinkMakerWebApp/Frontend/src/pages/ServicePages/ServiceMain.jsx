// src/pages/service/ServiceMain.jsx
import { useNavigate, Outlet } from 'react-router-dom'
import { useEffect, useState } from 'react'

import { heartbeatServiceLock, releaseServiceLock } from '../../services/lockService'
import './service.css'

function ServiceMain() {
  const navigate = useNavigate()
  const [buttonState, setButtonState] = useState(false)

  useEffect(() => {
    let alive = true

    const tick = async () => {
      try {
        // nový heartbeat na REST /lock/heartbeat/service
        await heartbeatServiceLock()
      } catch (err) {
        console.error("Heartbeat selhal", err)
        // Heartbeat selhal -> pokus o release a kopnout uživatele pryč
        try {
          await releaseServiceLock()
        } catch (e) {
          console.error("Release po heartbeat chybě selhal", e)
        }
        if (alive) navigate('/')
      }
    }

    // první heartbeat hned po mountu
    tick()
    // interval musí být kratší než TTL locku na backendu
    const interval = setInterval(tick, 5000) // např. TTL = 15s → HB = 5s

    // release při zavření/odchodu (best-effort)
    const sendReleaseKeepalive = () => {
      try {
        releaseServiceLock().catch(() => {})
      } catch {}
    }

    // „Zpět/Vpřed“ v historii prohlížeče
    const onPopState = () => {
      releaseServiceLock().catch(() => {})
    }

    //window.addEventListener('beforeunload', sendReleaseKeepalive)
    //window.addEventListener('pagehide', sendReleaseKeepalive)
    //window.addEventListener('popstate', onPopState)

    return () => {
      alive = false
      clearInterval(interval)
      // při unmountu uvolnit lock (když to stihneme)
      //releaseServiceLock().catch(() => {})
      //window.removeEventListener('beforeunload', sendReleaseKeepalive)
      //window.removeEventListener('pagehide', sendReleaseKeepalive)
      //window.removeEventListener('popstate', onPopState)
    }
  }, [navigate])


  const onBackClick = async () => {
    try {
      await releaseServiceLock()
    } catch (e) {
      console.error("Release při návratu selhal", e)
    }
    navigate('/')
  }

  const onButtonClick = () => {
    const next = !buttonState
    setButtonState(next)
    if (next) {
      navigate('/service/uart')
    } else {
      navigate('/service/serviceRemote')
    }
  }

  return (
    <div className="pages-centered-page">
      <div className="nav-buttons">
        <button className="back-button" onClick={onBackClick}>Zpět</button>
        <button className="icon-btn" onClick={onButtonClick}>
          {buttonState ? 'Main' : 'UART Test'}
        </button>
      </div>

      <div>
        <Outlet />
      </div>
    </div>
  )
}

export default ServiceMain
