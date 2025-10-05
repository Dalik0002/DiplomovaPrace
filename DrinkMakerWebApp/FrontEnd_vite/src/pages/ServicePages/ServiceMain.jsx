// src/pages/service/ServiceMain.jsx
import { useNavigate, Outlet } from 'react-router-dom'
import { useEffect } from 'react'
import { heartbeatService, releaseService } from '../../services/serviceLockService'
import { getClientId } from '../../services/clientId'     // kvůli keepalive fetchu
import './service.css'

function ServiceMain() {
  const navigate = useNavigate()

  useEffect(() => {
    let alive = true

    const tick = async () => {
      try {
        await heartbeatService()
      } catch {
        // Heartbeat selhal -> pokus o release a kopnout uživatele pryč
        try { await releaseService() } catch {}
        if (alive) navigate('/')
      }
    }

    // první heartbeat hned po mountu
    tick()
    const interval = setInterval(tick, 15_000)

    // release při zavření/odchodu (keepalive, aby proběhl i během unloadu)
    const sendReleaseKeepalive = () => {
      try {
        releaseService()
      } catch {}
    }

    // „Zpět/Vpřed“ v historii prohlížeče
    const onPopState = () => { releaseService().catch(() => {}) }

    window.addEventListener('beforeunload', sendReleaseKeepalive)
    window.addEventListener('pagehide', sendReleaseKeepalive)
    window.addEventListener('popstate', onPopState)

    return () => {
      alive = false
      clearInterval(interval)
      //releaseService().catch(() => {})
      window.removeEventListener('beforeunload', sendReleaseKeepalive)
      window.removeEventListener('pagehide', sendReleaseKeepalive)
      window.removeEventListener('popstate', onPopState)
    }
  }, [navigate])

  // „Zpět“ tlačítko – nejdřív release, pak domů
  const onBackClick = async () => {
    try { await releaseService() } catch {}
    navigate('/')
  }

  return (
    <div className="pages-centered-page">
      <div className="nav-buttons">
        <button className="back-button" onClick={onBackClick}>Zpět</button>
        <button onClick={() => navigate('/service/uart')}>UART Test</button>
      </div>

      <div>
        <Outlet />
      </div>
    </div>
  )
}

export default ServiceMain
