import { useNavigate } from 'react-router-dom'
import { Outlet } from 'react-router-dom'
import { useEffect } from 'react'
import { heartbeatService, releaseService } from '../../services/serviceLockService'
import './service.css'

function Service_main() {
  const navigate = useNavigate()

  useEffect(() => {
    const interval = setInterval(() => {
      heartbeatService().catch(() => {
        releaseService().finally(() => navigate('/'))
      })
    }, 15_000)

    const beforeUnload = () => {
      try {
        const base = import.meta.env.VITE_API_URL || ''
        navigator.sendBeacon(`${base}/service/release`)
      } catch {}
    }
    window.addEventListener('beforeunload', beforeUnload)

    return () => {
      clearInterval(interval)
      releaseService().catch(() => {})
      window.removeEventListener('beforeunload', beforeUnload)
    }
  }, [navigate])

  return (
    <div className="pages-centered-page">
      {/* Top bar */}
      <div className="nav-buttons">
        <button className="back-button" onClick={() => navigate('/')}>Zpět</button>
        <button onClick={() => navigate('/service/uart')}>UART Test</button>
      </div>

      {/* RESET card */}
      <section className="service-container">
        <h2 className="service-container-title">RESET</h2>
        <div className="service-row">
          <button className="service-btn">RESET MAIN NODE</button>
          <button className="service-btn">RESET CAROUSEL</button>
        </div>
      </section>

      {/* MOTORS card */}
      <section className="service-container">
        <h2 className="service-container-title">MOTORS</h2>
        <div className="service-row">
          <button className="service-btn">RELEASE PLATFORM</button>
          <button className="service-btn">RELEASE CAROUSEL</button>
        </div>
      </section>

      {/* CLEANING card */}
      <section className="service-container">
        <h2 className="service-container-title">CLEANING</h2>
        <div className="clean-grid">
          {Array.from({ length: 6 }).map((_, i) => (
            <div className="clean-cell" key={i}>
              <div className="clean-title">POSITION {i + 1}</div>
              <button className="service-btn">CLEAN</button>
            </div>
          ))}
        </div>
      </section>

      {/* Místo pro podstránky (např. UART Test) */}
      <div className="service-outlet">
        <Outlet />
      </div>
    </div>
  )
}

export default Service_main
