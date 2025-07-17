import React, { useState } from 'react';

function Ucet({ handleLogin, logoutHandler, isLoggedIn }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (username === 'admin' && password === 'admin') {
      handleLogin();
    } else {
      alert('Nesprávné jméno nebo heslo!');
    }
  };

  const handleLogoutClick = () => {
    logoutHandler();
    setUsername('');
    setPassword('');
  };

  return (
    <div>
      <h1 className=".custom-MQTT_Account-text">Přihlášení - Administrator</h1>
      <p>Zadejde přihlašovací údaje pro přihlášení administratora.</p>
      {isLoggedIn ? (
        <div>
          <p>Je přihlášen <b>ADMIN</b></p>
          <button onClick={handleLogoutClick}>Odhlásit</button>
        </div>
      ) : (
        <form onSubmit={handleSubmit}>
          <input
            type="text"
            placeholder="Uživatelské jméno"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
          />
          <input
            type="password"
            placeholder="Heslo"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          <button type="submit">Přihlásit</button>
        </form>
      )}
    </div>
  );
}

export default Ucet;
