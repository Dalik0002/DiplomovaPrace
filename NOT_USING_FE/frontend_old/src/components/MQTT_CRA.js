import React, { useState } from 'react';
import DataJSON_MQTT_CRA_Latest from '../AdminLogIn/DataJSON_CRA/MQTT_CRA_Latest';
import DataJSON_MQTT_CRA_All from '../AdminLogIn/DataJSON_CRA/MQTT_CRA_All';
import DataJSON_MQTT_CRA_ID from '../AdminLogIn/DataJSON_CRA/MQTT_CRA_ID';
import DataJSON_MQTT_CRA_Graph from '../AdminLogIn/DataJSON_CRA/MQTT_CRA_Graph';


function MQTT_CRA() {
  const [selectedOption, setSelectedOption] = useState(null);

  return (
    <div> 
      <h1 className=".custom-MQTT_Account-text">Data z MQTT CRA Broker</h1>
      <p>V případě, že je velikost vektorů (Intenzita vibrací motoru) mimo povolený limit, ukáže se hláška a je potřeba motor zkontrolovat.</p>
      <div className="menu-bar">
        <button onClick={() => setSelectedOption("all")}>Zobrazení všech příchozích zpráv</button>
        <button onClick={() => setSelectedOption("latest")}>Zobrazení poslední zprávy</button>
        <button onClick={() => setSelectedOption("byID")}>Výběr zprávy podle ID</button>
        <button onClick={() => setSelectedOption("GRAF")}>Zobrazení grafu</button>
      </div>
      {selectedOption === "all" && <DataJSON_MQTT_CRA_All />}
      {selectedOption === "latest" && <DataJSON_MQTT_CRA_Latest />}
      {selectedOption === "byID" && <DataJSON_MQTT_CRA_ID />}
      {selectedOption === "GRAF" && <DataJSON_MQTT_CRA_Graph />}
    </div>
  );
}

export default MQTT_CRA;
