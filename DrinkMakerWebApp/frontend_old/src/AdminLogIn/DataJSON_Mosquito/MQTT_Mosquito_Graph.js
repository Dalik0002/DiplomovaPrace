import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Line } from 'react-chartjs-2';
import Chart from 'chart.js/auto';
import '../../App.css';

function DataJSON_MQTT_All() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    axios.get('http://localhost:5253/api/MQTT/Data_Mosquito')
      .then(response => {
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

  // Function to get the 10 most recent data points
  const getRecentData = (dataArray) => {
    return dataArray
      .sort((a, b) => b.id - a.id) // Sort by ID in descending order to get latest first
      .slice(0, 20) // Get the top 10
      .sort((a, b) => a.id - b.id); // Optional: Sort by ID in ascending order for chart display
  };

  // Data pro graf teplot
  const temperatureChartData = {
    datasets: [
      {
        label: 'Teplota',
        data: getRecentData(data).map(item => ({x: item.id, y: item.temp})),
        fill: false,
        backgroundColor: 'rgb(231, 167, 47)',
        borderColor: 'rgba(231, 167, 47, 0.7)',
      },
    ],
  };

  // Data pro graf velikosti vektorů
  const magnitudeChartData = {
    datasets: [
      {
        label: 'Velikost vektorů',
        data: getRecentData(data).map(item => ({x: item.id, y: item.mag})),
        fill: false,
        backgroundColor: 'rgb(31, 224, 47)',
        borderColor: 'rgba(31, 224, 47, 0.7)',
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: true,
    scales: {
      x: {
        type: 'linear',
        position: 'bottom',
        
      },
    },
  };

  if (loading) return <p>Stahuju data z backendu...</p>;
  if (error) return <p>{error}</p>;

  return (
    <>
      {data && data.length > 0 && !error && (
        <>
          <h3>Data z backendu</h3>
          <div className="chart-container" style={{ width: '150%', height: '300px' }}>
            <Line data={temperatureChartData} options={chartOptions} />
          </div>
          <div className="chart-container" style={{ width: '100%', height: '300px' }}>
            <Line data={magnitudeChartData} options={chartOptions} />
          </div>
        </>
      )}
      {(!data || data.length === 0) && !error && <p>Žádná data k zobrazení</p>}
    </>
  );
}

export default DataJSON_MQTT_All;
