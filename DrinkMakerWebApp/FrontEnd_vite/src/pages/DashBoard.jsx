import { useNavigate } from 'react-router-dom'
import { useEffect, useState } from 'react'

import StateConteiner from '../components/StateConteiner'
import GlassesConteiner from '../components/GlassesConteiner'

import { useStateStatus} from '../hooks/useStateData';
import { useServiceStatus} from '../hooks/useServiceStatus';
import { acquireService } from '../services/serviceLockService';

import Loading from '../components/LoadingCom'
import Error from '../components/ErrorCom'

import './DashBoard.css'

function Dashboard() {
  const navigate = useNavigate()

  const {
    isLoading: l_state,
    error: err_state,
    isStandBy,
  } = useStateStatus();

  const {
    isBusy,
    isLoading: l_service,
    error: err_service,
    refresh: refreshService,
  } = useServiceStatus();

  
  const sendService = async () => {
    try {
      await acquireService();
      refreshService();
      navigate('/service');
    } catch (err) {
      alert('Service je právě obsazený. Zkuste to později.');
      refreshService();
    }
  };


  if (l_state || l_service) return <Loading/>
  if (err_state) return <Error mess={"Chyba při získávání stavu: " + err_state.message}/>
  if (err_service) return <Error mess={"Chyba služby: " + err_service.message} />

  return (
    <div className="dashboard-container">
      <div className="top-bar">
        <h1 className="title">DrinkMaker</h1>
        <div className="nav-buttons">
          <button onClick={() => navigate('/bottles')}>📦 Konfigurace lahví</button>
          <button onClick={sendService} disabled={isBusy}>
            {isBusy ? '⚙️ Servis (obsazeno)' : '⚙️ Servis'}
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
              disabled={!isStandBy}                       //musí být "!"
              onClick={() => navigate('/orderReview')}
            >
              ZAHÁJIT NALÉVÁNÍ 
            </button>
            <button
              className="add-button"onClick={() => navigate('/newDrink')}> PŘIDAT NOVÝ DRINK 
            </button>
          </div>
        </div>
        
        {/* Pravý sloupec */}
        <div className="right-column">
          <GlassesConteiner />
        </div>
      </div>

      <div className="footer">
        <h2>-- NIKDY TO NEKONČÍ U PRVNÍ RUNDY ;) --</h2>
      </div>
    </div>
  )
}

export default Dashboard
