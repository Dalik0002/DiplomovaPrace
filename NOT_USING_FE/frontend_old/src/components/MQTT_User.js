import React, { useState } from 'react';
import User_Data_Latest from '../UserLogIn/User_MQTT_CRA_Latest';
import User_Data_All from '../UserLogIn/User_MQTT_CRA_All';
import User_Data_ID from '../UserLogIn/User_MQTT_CRA_ID';


function User_Data() {
  const [selectedOption, setSelectedOption] = useState(null);

  return (
    <div>
      <h1 className=".custom-MQTT_Account-text">Diagnostika motoru</h1>
      <p>V případě, že je velikost vektorů (Intenzita vibrací motoru) mimo povolený limit, ukáže se hláška a je potřeba motor zkontrolovat.</p>
      <div className="menu-bar">
        <button onClick={() => setSelectedOption("all")}>Zobrazení všech příchozích zpráv</button>
        <button onClick={() => setSelectedOption("latest")}>Zobrazení poslední zprávy</button>
        <button onClick={() => setSelectedOption("byID")}>Výběr zprávy podle ID</button>
      </div>
      {selectedOption === "all" && <User_Data_All />}
      {selectedOption === "latest" && <User_Data_Latest />}
      {selectedOption === "byID" && <User_Data_ID />}
    </div>
  );
}

export default User_Data;
