
import { useState } from 'react'
import { sendInfo, previewInfo, sendGlasses, previewGlasses, sendBottles, previewBottles } from '../../services/uartService'; 
import './service.css'

const API_URL = import.meta.env.VITE_API_URL;

function UART_Test() {
  const [preview, setPreview] = useState(null)

  const previewFun = async (setFunc) => {
    const res = await setFunc
    setPreview(res)
  }

  return (
    <div className="centered-page">
      <h2>UART Test Panel</h2>
      <button onClick={() => send('sendMess?mess=Hello')}>Send Message</button>
      <button onClick={() => sendInfo()}>Send Info</button>
      <button onClick={() => sendGlasses()}>Send Glasses</button>
      <button onClick={() => sendBottles()}>Send Bottles</button>

      <button onClick={() => previewFun(previewInfo)}>Preview Info</button>
      <button onClick={() => previewFun(previewGlasses)}>Preview Glasses</button>
      <button onClick={() => previewFun(previewBottles)}>Preview Bottles</button>

      <div style={{ textAlign: 'left' }}>
        <p>Get Input State:</p>
        {preview && <pre>Data:{JSON.stringify(preview, null, 2)}</pre>}
      </div>
    </div>
  )
}

export default UART_Test