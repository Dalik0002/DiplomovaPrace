import React, { useEffect, useState } from 'react';
import axios from 'axios';

function User_Data_Latest() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    axios.get('http://localhost:5253/api/MQTT/Data_CRA/latest')
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
      <h3>Diagnostické data z motoru</h3>
      {data ? ( // Kontrola, zda data existují
        <div key={data.id} className="data-item">
          <p>Data úspěšně stažena: </p>
          <p>ID:   {data.id}</p>
          <p>Čas přijetí: {data.time}</p>
          <p><span style={{ color: data.warning ? 'red' : 'green' }}>{data.warning ? 'VIBRACE MIMO POVOLENÝ LIMIT' : 'VIBRACE V LIMITU'}</span></p>
      </div>
      ) : (
        <p>Při stahování dat se vyzkytla chyba</p>
      )}
    </div>
  );
}

export default User_Data_Latest;