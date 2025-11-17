
import { useState } from 'react'
import { sendUARTMessage, previewInfo, previewGlasses, previewBottles } from '../../services/uartService'; 
import './service.css'

function UART_Test() {
  const [preview, setPreview] = useState(null)

  const previewFun = async (setFunc) => {
    const res = await setFunc
    setPreview(res)
  }

  return (
    <div className="centered-page">
      <h2>UART Test Panel</h2>
      <button onClick={() => sendUARTMessage("Hello, World !!")}>Send Message</button>

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