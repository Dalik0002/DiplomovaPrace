/*import 'bootstrap/dist/css/bootstrap.min.css';
import { Routes, Route } from "react-router-dom";
//import React, { useState, useEffect } from 'react';
import { Container, Row, Col } from 'react-bootstrap';

import Navbar from './components/Navbar';
import ContentHome from './components/Hlavni_Strana';
import MQTT from './components/MQTT';
import MQTT_CRA from './components/MQTT_CRA';
import Sklep from './components/Sklep';
import Ucet from './components/Ucet';


function App()
{
  return (
    <div>
      <Container fluid>
        <Row>
          <Col xxl={3} xl={3} lg={4} md={5} sm={5.5} xs={6} className='custom-sidebar'>
            <Navbar />
          </Col>
          <Col xxl={9} xl={9} lg={8} md={7} sm={6.5} xs={6} className='custom-content custom-content-text'>
            <div className>
              <Routes>
                <Route path="/" element={<div className='default-content'><ContentHome /></div>} />
                <Route path="/MQTT" element={<div className='default-content'><MQTT /></div>}></Route>
                <Route path="/MQTT_CRA" element={<div className='default-content'><MQTT_CRA /></div>}></Route>
                <Route path="/sklep" element={<div className='default-content'><Sklep /></div>}></Route>
                <Route path="/Ucet" element={<div className='default-content'><Ucet /></div>}></Route>
            </Routes>
          </div>
        </Col>
      </Row>
    </Container>
    </div >
  );
}

    /*"start": "react-scripts start",

export default App;*/

import React, { useState } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import { Routes, Route } from 'react-router-dom';
import { Container, Row, Col } from 'react-bootstrap';
import Navbar from './components/Navbar';
import ContentHome from './components/Hlavni_Strana';
import MQTT from './components/MQTT_Mosquito';
import MQTT_CRA from './components/MQTT_CRA';
import User_Data from './components/MQTT_User';
import Ucet from './components/Ucet';

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  const handleLogin = () => {
    setIsLoggedIn(true);
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
  };

  return (
    <div>
      <Container fluid>
        <Row>
          <Col xxl={3} xl={3} lg={4} md={5} sm={5.5} xs={6} className='custom-sidebar'>
            <Navbar isLoggedIn={isLoggedIn} />
          </Col>
          <Col xxl={9} xl={9} lg={8} md={7} sm={6.5} xs={6} className='custom-content custom-content-text'>
            <div className='default-content'>
              <Routes>
                <Route path="/" element={<ContentHome isLoggedIn={isLoggedIn}/>} />
                <Route path="/User_Data" element={<User_Data />} />
                <Route path="/MQTT_CRA" element={<MQTT_CRA />} />
                <Route path="/MQTT" element={<MQTT />} />
                <Route path="/Ucet" element={<Ucet handleLogin={handleLogin} logoutHandler={handleLogout} isLoggedIn={isLoggedIn} />} />

                
              </Routes>
            </div>
          </Col>
        </Row>
      </Container>
    </div>
  );
}

export default App;
