import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Container } from 'react-bootstrap';
import '../../App.css';

function DataJSON_MQTT_CRA_All() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    axios.get('http://localhost:5253/api/MQTT/Data_CRA')
      .then(response => {
        console.log(response.data);
        setData(response.data);
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
    <Container className="data-container">
      {data && data.length > 0 && !error && (
        <>
          <h3>Data z backendu</h3>
          <p>Data uspěšně stažena: </p>
          {data.map(data => (
            <div key={data.id} className="data-item">
              <p>ID: {data.id}</p>
              <p>Čas přijetí: {data.time}</p>
              <p>Teplota: {data.temp}</p>
              <p>Velikost vektorů: {data.mag}</p>
              <p><span style={{ color: data.warning ? 'red' : 'green' }}>{data.warning ? 'VIBRACE MIMO POVOLENÝ LIMIT' : 'VIBRACE V LIMITU'}</span></p>
            </div>
          ))}
        </>
      )}
      {(!data || data.length === 0) && !error && (
        <p>Při stahování dat se vyzkytla chyba</p>
      )}
    </Container>
  );
}

export default DataJSON_MQTT_CRA_All;
