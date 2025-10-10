import React, { useEffect, useState } from 'react';
import axios from 'axios';

function User_Data_ID() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [inputID, setInputID] = useState('1'); // Používáme řetězec pro lepší ovládání vstupu
  const [selectedID, setSelectedID] = useState(1); // Výchozí hodnota ID
  const [maxID, setMaxID] = useState(null);

  const fetchMaxId = () => {
    axios.get(`http://localhost:5253/api/MQTT/Data_CRA/latest`)
      .then(response => {
        setMaxID(response.data.id); // Nastaví maximální ID získané z backendu
      })
      .catch(error => {
        console.error('Chyba při získávání maximálního ID:', error);
      });
  };

  const fetchData = (id) => {
    setLoading(true);
    axios.get(`http://localhost:5253/api/MQTT/Data_CRA/${id}`)
      .then(response => {
        console.log(response.data);
        setData(response.data);
        setError(null); // Resetuje předchozí chyby při úspěšném načtení
      })
      .catch(error => {
        console.error('Chyba při volání API:', error);
        if (error.response && error.response.status === 404) {
          // Specifická zpráva pro chybu 404
          setError('Zadané ID nebylo nalezeno.');
        } else {
          // Obecná chybová zpráva pro ostatní chyby
          setError('Při stahování dat došlo k chybě.');
        }
      })
      .finally(() => {
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchMaxId();
    fetchData(selectedID); // Zavolá fetchData() při změně selectedId
  }, [selectedID]);

  const handleIdChange = (e) => {
    setInputID(e.target.value); // Umožňuje uživateli zadat ID
  };

  const handleSubmit = () => {
    const id = parseInt(inputID, 10); // Převede řetězec na číslo
    if (!isNaN(id)) {
      setSelectedID(id); // Nastaví ID a spustí dotaz
    } else {
      setError('Zadané ID není platné číslo.');
    }
  };

  if (loading) return <p>Stahuju data z backendu...</p>;
  if (error) return <p>{error}</p>;

  return (
    <div>
      <h3>Vybrat ID: {maxID ? `(max ${maxID})` : ''}</h3>
      <input type="text" value={inputID} onChange={handleIdChange} />
      <button onClick={handleSubmit}>Vyhledat</button>
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

export default User_Data_ID;
