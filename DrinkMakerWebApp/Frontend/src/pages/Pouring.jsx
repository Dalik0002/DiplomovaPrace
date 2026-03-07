import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import { useInputData } from "../hooks/useInputData";
import { usePouringStatus } from "../hooks/usePouringStatus";
import Loading from "../components/LoadingCom";
import Error from "../components/ErrorCom";

import { setStop, resetStop } from '../services/stateService'
import "./Pouring.css";

export default function Pouring() {
  const navigate = useNavigate();
  const [stopping, setStopping] = useState(false);
  const [localErr, setLocalErr] = useState("");
  
  const { 
    stage, 
    message: stageMessage, 
    isRunning: isProcessRunning, 
    isDone: isProcessDone
   } = usePouringStatus();

  useEffect(() => {
    console.log(`[PROCESS] Stage: ${stage} | Msg: ${stageMessage} | Running: ${isProcessRunning}`);
  }, [stage, stageMessage, isProcessRunning]);
  
  const {
    isLoading,
    error,
    pouringDone,
    emergencyStop,
    processPouringStarted,
    messError,
    cannotProcessPosition,
    cannotProcessGlass,
    cannotSetMode,
  } = useInputData();

  useEffect(() => {
    if (!isLoading) {
      console.log(`[HW DATA] Started: ${processPouringStarted}, Done: ${pouringDone}, Emergency: ${emergencyStop}`);
      if (messError || cannotProcessPosition || cannotProcessGlass) {
        console.log(`[HW ERROR] Mess: ${messError}, Pos: ${cannotProcessPosition}, Glass: ${cannotProcessGlass}`);
      }
    }
  }, [isLoading, processPouringStarted, pouringDone, emergencyStop, messError, cannotProcessPosition, cannotProcessGlass])

  const goHome = () => {
    navigate("/", { replace: true });
  };
  

  // Emergency stop => okamžitě pryč
  useEffect(() => {
    if (emergencyStop) {
      alert("EMERGENCY STOP!");
      navigate("/", { replace: true });
    }
  }, [emergencyStop, navigate]);
  
  const handleStop = async () => {
    console.log("[ACTION] Uživatel klikl na STOP.");
    setLocalErr("");
    setStopping(true);
    try {
      await setStop();
      goHome();
    } catch (e) {
      console.error("[ACTION] Chyba při odesílání STOP:", e);
      setLocalErr("Nepodařilo se odeslat STOP. Zkuste to znovu.");
    } finally {
      setStopping(false);
    }
  };

  if (isLoading) return <Loading />;
  if (error) return <Error mess={"Chyba: " + error.message} />;

  // HOTOVO screen
  if (pouringDone) {
    return (
      <div className="pouring-page">
        <div className="pouring-card pouring-done-card">

          <div className="pouring-done-icon">
            ✓
          </div>

          <h1 className="pouring-title pouring-done-title">
            Hotovo!
          </h1>

          <p className="pouring-status">
            Nápoj byl úspěšně připraven.
          </p>

          <button className="home-button" onClick={goHome}>
            Zpět na hlavní stránku
          </button>

        </div>
      </div>
    );
  }

  // PROBÍHÁ / čekám
  const statusText = processPouringStarted
    ? "Probíhá nalávání vašich nápojů..."
    : "Připravuji zařízení k nalévání...";

  // volitelné: jednoduchá chyba do UI (když nechceš, smaž)
  const processErr =
    (messError && "Chyba procesu (mess_error)") ||
    (cannotProcessPosition && "Nelze zpracovat pozici") ||
    (cannotProcessGlass && "Nelze zpracovat sklenici") ||
    (cannotSetMode && "Nelze nastavit režim") ||
    "";

  return (
    <div className="pouring-page">
      <div className="pouring-card">
        {/* Dynamický titulek podle fáze */}
        <h1 className="pouring-title">
          {stage.includes("CHECK") ? "🔍 Kontrola" : "🍹 Nalévání"}
        </h1>

        {/* Zobrazení aktuální zprávy z Pythonu */}
        <p className="pouring-status">
          {stageMessage || "Připravuji zařízení..."}
        </p>
        
        <div className="pouring-spinner-wrap">
          <div className={`pouring-spinner ${stage.includes("WAIT") ? "spinner-slow" : ""}`} />
        </div>

        {/* Zobrazení technické fáze (badge) */}
        <div className="pouring-stage-badge">{stage}</div>

        {/* Chybové hlášky z HW */}
        {(messError || cannotProcessPosition || cannotProcessGlass || cannotSetMode) && (
          <p className="pouring-warn">
            ⚠️ {(messError && "Chyba mechanismu") || "Problém s pozicí/sklenicí"}
          </p>
        )}

        {localErr && <p className="pouring-error">❌ {localErr}</p>}

        <button
          className="stop-button"
          onClick={handleStop}
          disabled={stopping}
        >
          {stopping ? "Odesílám STOP..." : "STOP"}
        </button>
      </div>
    </div>
  );
}