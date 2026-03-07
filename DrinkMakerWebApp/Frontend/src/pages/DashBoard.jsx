import { useNavigate } from 'react-router-dom'
import { useEffect, useState, useRef } from 'react'

import StateConteiner from '../components/StateConteiner'
import GlassesConteiner from '../components/GlassesConteiner'

import { useStateStatus} from '../hooks/useStateData';
import { useServiceStatus} from '../hooks/useServiceStatus';
import { useInputData } from '../hooks/useInputData'
import { setService } from '../services/stateService'

import { acquireServiceLock, releaseServiceLock } from '../services/lockService';

import Loading from '../components/LoadingCom'
import Error from '../components/ErrorCom'

import './DashBoard.css'

function Dashboard() {
  const navigate = useNavigate()

  const {
    isLoading: l_state,
    error: err_state,
    isStandBy,
    isService,
    refresh: refreshState,
  } = useStateStatus();

  const {
    isLoading: l_service,
    error: err_service,
    isBusy,
    refresh: refreshService,
  } = useServiceStatus();

  const { totalProblemsCount, processPouringStarted } = useInputData()

  const [pendingServiceNav, setPendingServiceNav] = useState(false)
  const serviceTimeoutRef = useRef(null)

  useEffect(() => {
    if (processPouringStarted) {
      navigate('/pouring');
    }
  }, [processPouringStarted, navigate]);

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
      const res = await acquireServiceLock();
      
      if (res.ok) {
        // Lock získán → přechod na servisní stránku
        try {
          await setService()
        } catch (e) {
          console.error("Set service modu selhal", e)
          try { await releaseServiceLock() } catch {}

          refreshService()
          alert("Nepodařilo se přepnout do SERVICE.")
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
        alert("Service je právě obsazený. Zkuste to později.");
        refreshService();
        return
      }

    } catch (err) {
      console.error(err);
      alert("Nepodařilo se ověřit lock servisu. Zkuste to později.");
      refreshService();
    }
  };

  const serviceLabel = err_service
  ? '⚙️ Servis (Nedostupný)'
  : pendingServiceNav
    ? '⚙️ Servis (přepínám...)'
    : (isBusy ? '⚙️ Servis (obsazeno)' : '⚙️ Servis')

  const serviceDisabled = !!err_service || pendingServiceNav || (isBusy && !pendingServiceNav)


  //if (l_state || l_service) return <Loading/>
  //if (err_state) return <Error mess={"Chyba při získávání stavu: " + err_state.message}/>
  //if (err_service) return <Error mess={"Chyba služby: " + err_service.message} />

  return (
    <div className="dashboard-container">
      <div className="top-bar">
        <h1 className="title">DrinkMaker</h1>
        <div className="nav-buttons">
          <button onClick={() => navigate('/bottles')}>📦 Konfigurace lahví</button>
          <button onClick={handleServiceClick} disabled={serviceDisabled}>
            {serviceLabel}
            {!!totalProblemsCount && !err_service && !pendingServiceNav && (
              <span className="service-badge" aria-label={`Počet problémů: ${totalProblemsCount}`}>
                ! {totalProblemsCount}
              </span>
            )}
          </button>
        </div>
      </div>

      <div className="core-container">
        {/* Levý sloupec*/}
        <div className="left-column">
          <StateConteiner />
          <div className="control-container">
            <button
              className="start-button"
              disabled={!isStandBy}                       //musí být "!" pro simulaci bez
              onClick={() => navigate('/orderReview')}
            >
              ZAHÁJIT NALÉVÁNÍ 
            </button>
            <button
              className="add-button"onClick={() => navigate('/newDrink')}> PŘIDAT NOVÝ NÁPOJ 
            </button>
          </div>
        </div>
        
        {/* Pravý sloupec */}
        <div className="right-column">
          <GlassesConteiner />
        </div>
      </div>
      
      {/*
      <div className="footer">
        <h2>-- NIKDY TO NEKONČÍ U PRVNÍ RUNDY ;) --</h2>
      </div>
      */}
    </div>
  )
}

export default Dashboard
