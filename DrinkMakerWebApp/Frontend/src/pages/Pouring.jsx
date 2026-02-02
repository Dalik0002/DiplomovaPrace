import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import { useInputData } from "../hooks/useInputData";
import Loading from "../components/LoadingCom";
import Error from "../components/ErrorCom";

import { setStop, resetStop } from '../services/stateService'
import "./Pouring.css";

export default function Pouring() {
  const navigate = useNavigate();
  const [stopping, setStopping] = useState(false);
  const [localErr, setLocalErr] = useState("");

  const {
    isLoading,
    error,

    pouringDone,
    emergencyStop,
    processPouringStarted,

    // volitelné: když chceš zobrazit i chyby
    messError,
    cannotProcessPosition,
    cannotProcessGlass,
    cannotSetMode,
  } = useInputData();

  // Emergency stop => okamžitě pryč
  useEffect(() => {
    if (emergencyStop) {
      alert("EMERGENCY STOP!");
      navigate("/", { replace: true });
    }
  }, [emergencyStop, navigate]);

  const goHome = () => navigate("/", { replace: true });
  const handleStop = async () => {
    setLocalErr("");
    setStopping(true);
    try {
      await setStop();
      goHome();
    } catch (e) {
      console.error(e);
      setLocalErr("Nepodařilo se odeslat STOP. Zkuste to znovu.");
    } finally {
      setStopping(false);
    }
  };

  if (isLoading) return <Loading />;
  if (error) return <Error mess={"Chyba při získávání InputData: " + error.message} />;

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
    : "Čekám, až se nalévání opravdu spustí...";

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
        <h1 className="pouring-title">🍹 Nalévání</h1>

        <p className="pouring-status">{statusText}</p>
        {processPouringStarted && !pouringDone && (
            <div className="pouring-spinner-wrap">
              <div className="pouring-spinner" />
            </div>
        )}

        {processErr && <p className="pouring-warn">⚠️ {processErr}</p>}
        {localErr && <p className="pouring-error">❌ {localErr}</p>}

        <button
          className="stop-button"
          onClick={handleStop}
          disabled={stopping}
        >
          {stopping ? "Odesílám STOP..." : "STOP"}
        </button>

        <p className="pouring-hint">
          Stav se aktualizuje každých 5 s (SWR refreshInterval).
        </p>
      </div>
    </div>
  );
}
