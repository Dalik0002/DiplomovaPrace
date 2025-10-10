import 'bootstrap/dist/css/bootstrap.min.css';
import React from "react";
import '../App.css';


function Hlavni_Strana({ isLoggedIn }) 
{
    /*const data = {
        labels: ["Jan", "Feb", "Mar", "Apr", "May", "Jun"],
        datasets: [
          {
            label: "First dataset",
            data: [33, 53, 85, 41, 44, 65],
            fill: true,
            backgroundColor: "rgba(75,192,192,0.2)",
            borderColor: "rgba(75,192,192,1)"
          },
          {
            label: "Second dataset",
            data: [33, 25, 35, 51, 54, 76],
            fill: false,
            borderColor: "#742774"
          }
        ]
    };*/


    return (
    <div>
        <h1 className="custom-Hlavni_Strana-text">HLAVNÍ STRÁNKA</h1>


      <div>
        <p>Toto webové prostředí slouží pro vizualiazci průmysových procesních dat.</p>
        <p>Stránka čerpá data z backendu, který je nastaven jako MQTT subscriber a čerpá data z brokeru Českých radiokouminikací.</p>
        
        <div>
        <h5><strong>Kategorie:</strong></h5>
            <ul>
              <li>
                <p><strong>DIAGNOSTIKA:</strong></p>
                <p>Zde si může uživatel zobrazit příchozí zprávy z měřícího zařízení.</p>
              </li>

              {isLoggedIn &&<li>
                <p><strong>CRA:</strong></p>
                <p>CRA broker slouží pro testování příchozích zpráv z LoRa sítě a MCU.</p>
              </li>}

              {isLoggedIn &&<li>
                <p><strong>MOSQUITO:</strong></p>
                <p>Mosquito broker slouží pro testování bez potřeby funkční desky s MCU. Jepoužíván python script.</p>
              </li>}

              <li>
                <p><strong>PŘIHLÁŠENÍ ADMINA:</strong></p>
                <p>Zde je možnost přihlášení administratora. Nachází se zde také případné odhlášení.</p>
              </li>
            </ul>
      </div>
    </div>


        <div className="App">
            {/*<Line data={data} />*/}
        </div>
        
    </div>
    )
}

export default Hlavni_Strana;






