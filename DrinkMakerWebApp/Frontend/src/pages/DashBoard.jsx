import { useNavigate } from 'react-router-dom'
import { useEffect, useState } from 'react'

import StateConteiner from '../components/StateConteiner'
import GlassesConteiner from '../components/GlassesConteiner'

import { useStateStatus} from '../hooks/useStateData';
import { useServiceStatus} from '../hooks/useServiceStatus';
import { useInputData } from '../hooks/useInputData'
import { setService } from '../services/stateService'

import { acquireServiceLock } from '../services/lockService';

import Loading from '../components/LoadingCom'
import Error from '../components/ErrorCom'

import './DashBoard.css'

function Dashboard() {
  const navigate = useNavigate()
  const [status, setStatus] = useState('')

  const {
    isLoading: l_state,
    error: err_state,
    isStandBy,
  } = useStateStatus();

  const {
    isLoading: l_service,
    error: err_service,
    isBusy,
    refresh: refreshService,
  } = useServiceStatus();

  const { totalProblemsCount, processPouringStarted } = useInputData()

  useEffect(() => {
    if (processPouringStarted) {
      navigate('/pouring');
    }
  }, [processPouringStarted, navigate]);

  const handleServiceClick = async () => {
  setStatus("");

    try {
      const res = await acquireServiceLock();

      if (res.ok) {
        // Lock získán → přechod na servisní stránku
        try {
          await setService()
        } catch (e) {
          console.error("Set service modu selhal", e)
        }
        navigate("/service/serviceRemote");

      } else {
        alert("Service je právě obsazený. Zkuste to později.");
        refreshService();
      }
    } catch (err) {
      console.error(err);
      alert("Nepodařilo se ověřit lock servisu. Zkuste to později.");
      refreshService();
    }
  };


  if (l_state || l_service) return <Loading/>
  //if (err_state) return <Error mess={"Chyba při získávání stavu: " + err_state.message}/>
  //if (err_service) return <Error mess={"Chyba služby: " + err_service.message} />

  //if (err_state) setStatus('❌ Chyba při získávání stavu.')
  //if (err_service) setStatus('❌ Chyba při získávání informace o servisu.')

  return (
    <div className="dashboard-container">
      <div className="top-bar">
        <h1 className="title">DrinkMaker</h1>
        <div className="nav-buttons">
          <button onClick={() => navigate('/bottles')}>📦 Konfigurace lahví</button>
          <button onClick={handleServiceClick} disabled={isBusy || err_service}>
            {err_service ? '⚙️ Servis (Nedostupný)' : (isBusy ? '⚙️ Servis (obsazeno)' : '⚙️ Servis')}
            {!!totalProblemsCount && !err_service && (
              <span className="service-badge" aria-label={`Počet problémů: ${totalProblemsCount}`}>
                ! {totalProblemsCount}
              </span>
            )}
          </button>
        </div>
      </div>
      {status && <p>{status}</p>}

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
