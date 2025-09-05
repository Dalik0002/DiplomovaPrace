import { useNavigate } from 'react-router-dom'
import { useEffect, useState } from 'react'

import StateConteiner from '../components/StateConteiner'
import QueueListConteiner from '../components/QueueListConteiner'

import { useStateStatus} from '../hooks/useStateData';
import { useServiceStatus} from '../hooks/useServiceStatus';
import { acquireService } from '../services/serviceLockService';

import './DashBoard.css'

function Dashboard() {
  const navigate = useNavigate()

  const {
    data: state,
    isLoading: l_state,
    error: e_state,
    refresh: refreshState,
  } = useStateStatus();

  const {
    data: service,
    isBusy,
    isLoading: l_service,
    error: e_service,
    refresh: refreshService,
  } = useServiceStatus();

  
  const sendService = async () => {
    try {
      await acquireService();
      // po úspěchu refreshni stav servisu (volitelné)
      refreshService();
      navigate('/service');
    } catch (err) {
      alert('Service je právě obsazený. Zkuste to později.');
      // volitelně re-fetch
      refreshService();
    }
  };

  const disableStart = state === "STAND BY"; // musí být: !==

  if (l_state || l_service) return <p>Načítání…</p>;
  if (e_state) return <p className="error">Chyba při získávání stavu: {e_state.message}</p>;
  if (e_service) return <p className="error">Chyba služby: {e_service.message}</p>;

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
              disabled={disableStart}
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
          <QueueListConteiner />
        </div>
      </div>

      <div className="footer">
        <h2>DrinkMaker © 2025</h2>
      </div>
    </div>
  )
}

export default Dashboard
