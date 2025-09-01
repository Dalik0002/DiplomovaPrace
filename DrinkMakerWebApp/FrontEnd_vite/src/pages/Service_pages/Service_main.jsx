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
        // ztratili jsme lock (např. server restart) → můžeš přesměrovat ven
        // navigate('/'); nebo zobrazit info
      })
    }, 20_000) // méně než TTL (60 s)

    const beforeUnload = () => { try { navigator.sendBeacon('/service/release') } catch {} }
    window.addEventListener('beforeunload', beforeUnload)

    return () => {
      clearInterval(interval)
      releaseService().catch(()=>{})
      window.removeEventListener('beforeunload', beforeUnload)
    }
  }, [])

  return (
    <div className="pages-centered-page">
      <button className = "back-button" onClick={() => navigate('/')}>Zpět</button>
      <div className="nav-bar">
        <button onClick={() => navigate('/service/uart')}>UART Testy</button>
        <button onClick={() => navigate('/service/clean')}>Čištění</button>
      </div>
      <div style={{ width: '100%' }}>
        <Outlet />
      </div>
    </div>
  )
}

export default Service_main