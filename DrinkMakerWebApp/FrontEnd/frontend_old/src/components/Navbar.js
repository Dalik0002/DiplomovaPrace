import React from 'react';
import { Link } from 'react-router-dom';
import 'bootstrap-icons/font/bootstrap-icons.css';
import '../App.css';

function Navbar({ isLoggedIn }) {

  
  return (
    <div>
      <nav>
        <div>
        <p style={{marginLeft: '50px', marginTop: '20px', color: 'white', fontSize: '20px', fontWeight: 'Bold'}}> Přihlášen: {isLoggedIn ? "ADMIN" : "UŽIVATEL"}</p>

          <Link to="/" className="custom-nav-link" style={{ marginTop: '30px' }}>HLAVNÍ STRÁNKA</Link>

          <Link to="/User_Data" className="custom-nav-link">DIAGNOSTIKA</Link>
          {isLoggedIn && <Link to="/MQTT_CRA" className="custom-nav-link">CRA</Link>}
          {isLoggedIn && <Link to="/MQTT" className="custom-nav-link">MOSQUITO</Link>}
          
          <Link to="/Ucet" className="custom-nav-link-account"> PŘIHLÁŠENÍ ADMINA</Link>
                  
        </div>
      </nav>
    </div>
  );
}

export default Navbar;




