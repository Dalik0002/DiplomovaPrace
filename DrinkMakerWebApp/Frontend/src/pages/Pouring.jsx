import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import { useInputData } from "../hooks/useInputData";
import { usePouringStatus } from "../hooks/usePouringStatus";
import Loading from "../components/LoadingCom";
import Error from "../components/ErrorCom";

import { resetStop } from '../services/stateService'
import { cancelPouring } from '../services/pouringService'
import "./Pouring.css";

export default function Pouring() {
  const navigate = useNavigate();
  const [stopping, setStopping] = useState(false);
  const [localErr, setLocalErr] = useState("");
  
  const { 
    stage, 
    message: stageMessage, 
    isRunning: isProcessRunning,
    processError,
    isDone,
    isPartial,
    isCancelled,
    isFailed,
    isFinished,
    resultText,
    donePositions,
    failedPositions,
    expectedPositions,
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
    if (messError || cannotProcessPosition || cannotProcessGlass || cannotSetMode) {
      console.log(
        `[HW ERROR] Mess: ${messError}, Pos: ${cannotProcessPosition}, Glass: ${cannotProcessGlass}, Mode: ${cannotSetMode}`
      );
    }
    }
  }, [isLoading, processPouringStarted, pouringDone, emergencyStop, messError, cannotProcessPosition, cannotProcessGlass])

  const goHome = async () => {
    try {
      await setStop()
    } catch (e) {
      console.error("Reset stop modu selhal", e)
    }
    navigate("/", { replace: true });
  };

  const goHomeNoStadby = () => {
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
      await cancelPouring();
      goHomeNoStadby();
    } catch (e) {
      console.error("[ACTION] Chyba při STOP/cancel:", e);
      setLocalErr("Nepodařilo se zastavit proces. Zkuste to znovu.");
    } finally {
      setStopping(false);
    }
  };

  if (isLoading) return <Loading />;
  if (error) return <Error mess={"Chyba: " + error.message} />;

  // HOTOVO screen
  if (isFinished) {
    const allCount = expectedPositions.length;
    const doneCount = donePositions.length;
    const failedCount = failedPositions.length;

    let icon = "✓";
    let title = "Hotovo!";
    let cardClass = "pouring-done-card";

    if (isPartial) {
      icon = "!";
      title = "Dokončeno částečně";
      cardClass = "pouring-partial-card";
    }

    if (isFailed) {
      icon = "✕";
      title = "Proces selhal";
      cardClass = "pouring-failed-card";
    }

    if (isCancelled) {
      icon = "⏹";
      title = "Proces zrušen";
      cardClass = "pouring-failed-card";
    }

    return (
      <div className="pouring-page">
        <div className={`pouring-card ${cardClass}`}>
          <div className="pouring-result-icon">
            {icon}
          </div>

          <h1 className="pouring-title pouring-result-title">
            {title}
          </h1>

          <p className="pouring-status">
            {resultText || stageMessage || "Proces byl ukončen."}
          </p>

          <div className="pouring-summary">
            <p>Počet objednaných sklenic: <strong>{allCount}</strong></p>
            <p>Hotové: <strong>{doneCount}</strong></p>
            <p>Selhané: <strong>{failedCount}</strong></p>

            {donePositions.length > 0 && (
              <p>Hotové pozice: <strong>{donePositions.map(i => i + 1).join(", ")}</strong></p>
            )}

            {failedPositions.length > 0 && (
              <p>Selhané pozice: <strong>{failedPositions.map(i => i + 1).join(", ")}</strong></p>
            )}
          </div>

          {processError && processError !== resultText && (
            <p className="pouring-error">❌ {processError}</p>
          )}

          <button className="home-button" onClick={goHome}>
            Zpět na hlavní stránku
          </button>
        </div>
      </div>
    );
  }

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
        {(cannotProcessPosition || cannotProcessGlass || cannotSetMode) && (
          <p className="pouring-warn">
            ⚠️ {cannotProcessPosition && "Nelze zpracovat pozici"}
            {cannotProcessGlass && " Nelze zpracovat sklenici"}
            {cannotSetMode && " Nelze nastavit režim"}
          </p>
        )}

        {messError && !cannotProcessPosition && !cannotProcessGlass && !cannotSetMode && (
          <p className="pouring-warn">
            ℹ️ Probíhá opakování komunikace se zařízením...
          </p>
        )}

        {localErr && <p className="pouring-error">❌ {localErr}</p>}

        <div className="pouring-actions">
          <button
            className="stop-button"
            onClick={handleStop}
            disabled={stopping}
          >
            {stopping ? "Odesílám STOP..." : "STOP"}
          </button>
        </div>
      </div>
    </div>
  );
}