// src/pages/service/ServiceMainCom.jsx
import './service.css'

function ServiceMainCom() {
  
  return (
    <div className="pages-centered-page">
      <div className="service-container">
        <div className="service-row">
          {/* RESET card */}
          <div className="service-container">
            <h2 className="service-container-title">RESTARTOVAT</h2>
            <div className="service-column">
              <button className="service-btn">RESTARTOVAT HLAVNI JEDNOTKU</button>
              <button className="service-btn">RESTARTOVAT JEDNOTKY NA KARUSELU</button>
            </div>
          </div>

          {/* MOTORS card */}
          <div className="service-container">
            <h2 className="service-container-title">MOTORY</h2>
            <div className="service-column">
              <button className="service-btn">UVOLNIT PATRO</button>
              <button className="service-btn">UVOLNIT KARUSEL</button>
            </div>
          </div>
        </div>

        {/* CLEANING card */}
        <div className="service-container">
          <h2 className="service-container-title">ČISTĚNÍ</h2>
          <div className="clean-grid">
            {Array.from({ length: 6 }).map((_, i) => (
              <div className="clean-cell" key={i}>
                <div className="clean-title">POZICE {i + 1}</div>
                <button className="service-btn">ČISTIT</button>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

export default ServiceMainCom
