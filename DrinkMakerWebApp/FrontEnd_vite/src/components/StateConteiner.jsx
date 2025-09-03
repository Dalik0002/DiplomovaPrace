import { useEffect, useState, useCallback } from 'react'
import { setStop, resetStop } from '../services/stateService'
import './StateConteiner.css'

import { useStateStatus} from '../hooks/useStateData';

function StateConteiner() {
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [ackChecked, setAckChecked] = useState(false)
  const [submitting, setSubmitting] = useState(false)

  const {
    data: state,
    isLoading: l_state,
    error: e_state,
    refresh: refreshState,
    isStop,
  } = useStateStatus();

  // tohle se volá po potvrzení v modálu
  const sendReseteStop = useCallback(async () => {
    try {
      setSubmitting(true)
      await resetStop()
    } catch (err) {
      console.error(err)
      setError("Nepodařilo se odeslat STOP.")
    } finally {
      setSubmitting(false)
      setIsModalOpen(false)
      setAckChecked(false)
      refreshState();
    }
  }, [])

  const openConfirm = async () => { 
    try { 
      await setStop()
      setIsModalOpen(true) 
    } catch (err) { 
      console.error(err) 
    } 
  }

  const openConfirmKvit = async () => { 
    try { 
      setIsModalOpen(true) 
    } catch (err) { 
      console.error(err) 
    } 
  }

  const closeConfirm = () => {
    if (!submitting) {
      setIsModalOpen(false)
      setAckChecked(false)
    }
  }

  const getStateClass = (state) => {
  switch (state) {
    case "STAND BY":
      return "state-standby"; 
    case "STOP":
      return "state-stop";    
    case "CHECKING":
      return "state-checking";
    case "POURING":
      return "state-pouring"; 
    case "SERVICE":
      return "state-service"; 
    case "UPDATING":
      return "state-updating";
    default:
      return "state-unknown"; 
  }
};

  return (
    <div className="state-container">
      <h2 className="state-title">Stav</h2>

      {l_state ? (
        <p>Stahování...</p>
      ) : e_state ? (
        <p className="error-message">{e_state}</p>
      ) : (
        <div className={`state-info ${getStateClass(state?.data)}`}>
          {state?.data == null ? <p>NO DATA</p> : <p>{state.data}</p>}
        </div>
      )}

      {isStop ? (
        <button className="stop-button" onClick={openConfirmKvit}>Kvitace STOP</button>
      ) : (
        <button className="stop-button" onClick={openConfirm}>STOP</button>
      )}

      {isModalOpen && (
        <div
          className="modal-backdrop"
          onClick={closeConfirm}
          onKeyDown={(e) => {
            if (e.key === 'Escape') closeConfirm()
          }}
          role="dialog"
          aria-modal="true"
        >
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <h3>Zařízení v režimu STOP</h3>
            <p>Odstraňte veškeré závady a důkladně zkonktolujte zařizení před opětovným uvedním do normalního chodu.</p>

            <label className="ack-row">
              <input
                type="checkbox"
                checked={ackChecked}
                onChange={(e) => setAckChecked(e.target.checked)}
              />
              <span>Potrzuji, že zařízení je připraveno.</span>
            </label>

            <div className="modal-actions">
              <button
                className="btn-danger"
                onClick={sendReseteStop}
                disabled={!ackChecked || submitting}
              >
                {submitting ? 'Odesílám…' : 'Potvrdit'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default StateConteiner
