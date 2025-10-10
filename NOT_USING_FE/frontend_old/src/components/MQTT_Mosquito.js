import React, { useState } from 'react';
import DataJSON_MQTT_Latest from '../AdminLogIn/DataJSON_Mosquito/MQTT_Mosquito_Latest';
import DataJSON_MQTT_All from '../AdminLogIn/DataJSON_Mosquito/MQTT_Mosquito_All';
import DataJSON_MQTT_ID from '../AdminLogIn/DataJSON_Mosquito/MQTT_Mosquito_ID';
import DataJSON_MQTT_Graph from '../AdminLogIn/DataJSON_Mosquito/MQTT_Mosquito_Graph';


function MQTT_CRA() {
  const [selectedOption, setSelectedOption] = useState(null);

  return (
    <div>
      <h1 className=".custom-MQTT_Account-text">Data z MQTT Mosquito Broker</h1>
      <p>V případě, že je velikost vektorů (Intenzita vibrací motoru) mimo povolený limit, ukáže se hláška a je potřeba motor zkontrolovat.</p>
      <div className="menu-bar">
        <button onClick={() => setSelectedOption("all")}>Zobrazení všech příchozích zpráv</button>
        <button onClick={() => setSelectedOption("latest")}>Zobrazení poslední zprávy</button>
        <button onClick={() => setSelectedOption("byID")}>Výběr zprávy podle ID</button>
        <button onClick={() => setSelectedOption("GRAF")}>Zobrazení grafu</button>
      </div>
      {selectedOption === "all" && <DataJSON_MQTT_All />}
      {selectedOption === "latest" && <DataJSON_MQTT_Latest />}
      {selectedOption === "byID" && <DataJSON_MQTT_ID />}
      {selectedOption === "GRAF" && <DataJSON_MQTT_Graph />}
    </div>
  );
}

export default MQTT_CRA;