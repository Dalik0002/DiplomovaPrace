// src/Service_pages/UART_Test.jsx
import { useState } from 'react'

function UART_Test() {
  const [previewInfo, setPreviewInfo] = useState(null)
  const [previewGlasses, setPreviewGlasses] = useState(null)
  const [previewPosition, setPreviewPosition] = useState(null)
  const [inputState, setInputState] = useState(null)

  const send = (endpoint) => {
    fetch(`http://localhost:8000/uart/${endpoint}`, {
      method: 'POST'
    })
  }

  const preview = async (endpoint, setFunc) => {
    const res = await fetch(`http://localhost:8000/uart/${endpoint}`)
    const data = await res.json()
    setFunc(data)
  }

  return (
    <div className="centered-page">
      <h1>UART Test Panel</h1>
      <div className="glass-container">
        <button onClick={() => send('sendMess?mess=Hello')}>Send Message</button>
        <button onClick={() => send('sendInfo')}>Send Info</button>
        <button onClick={() => send('sendGlasses')}>Send Glasses</button>
        <button onClick={() => send('sendPosition')}>Send Position</button>

        <button onClick={() => preview('previewInfo', setPreviewInfo)}>Preview Info</button>
        <button onClick={() => preview('previewGlasses', setPreviewGlasses)}>Preview Glasses</button>
        <button onClick={() => preview('previewPosition', setPreviewPosition)}>Preview Position</button>
        <button onClick={() => preview('inputState', setInputState)}>Input State</button>
      </div>

      <div style={{ textAlign: 'left' }}>
        {previewInfo && <pre>Info:
{JSON.stringify(previewInfo, null, 2)}</pre>}
        {previewGlasses && <pre>Glasses:
{JSON.stringify(previewGlasses, null, 2)}</pre>}
        {previewPosition && <pre>Position:
{JSON.stringify(previewPosition, null, 2)}</pre>}
        {inputState && <pre>Input State:
{JSON.stringify(inputState, null, 2)}</pre>}
      </div>
    </div>
  )
}

export default UART_Test