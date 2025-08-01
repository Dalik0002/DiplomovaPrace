
import React, { useEffect, useState } from 'react';
import axios from 'axios';

function DataJSON_MQTT_Latest() {
  const [data, setData] = useState(null); // Uložení jednoho objektu dat
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    axios.get('http://localhost:5253/api/MQTT/Data_Mosquito/latest')
      .then(response => {
        console.log(response.data);
        setData(response.data); // Předpokládá, že API vrací jeden objekt
      })
      .catch(error => {
        console.error('Chyba při volání API:', error);
        setError('Při stahování dat došlo k chybě.');
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  if (loading) return <p>Stahuju data z backendu...</p>;
  if (error) return <p>{error}</p>;

  return (
    <div>
      <h3>Data z backendu</h3>
      {data ? ( // Kontrola, zda data existují
        <div key={data.id} className="data-item">
          <p>Data uspěšně stahnuta: </p>
          <p>ID:   {data.id}</p>
          <p>Čas přijetí: {data.time}</p>
          <p>Teplota:   {data.temp} °C</p>
          <p>Velikost vektorů: {data.mag}</p>
          <p><span style={{ color: data.warning ? 'red' : 'green' }}>{data.warning ? 'VIBRACE MIMO POVOLENÝ LIMIT' : 'VIBRACE V LIMITU'}</span></p>
        </div>
      ) : (
        <p>Žádná data k zobrazení</p>
      )}
    </div>
  );
}

export default DataJSON_MQTT_Latest;


