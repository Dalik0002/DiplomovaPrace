import { useLocation, useNavigate } from 'react-router-dom'
import './Components.css'

function BackButton() {
  const { pathname } = useLocation()
  const navigate = useNavigate()

  if (pathname === '/') return null

  return (
    <button
      className="back-button"
      onClick={() => {
        if (window.history.length > 2) {
          navigate(-1)
        } else {
          navigate('/')
        }
      }}
    >
      ← Back
    </button>
  )
}

export default BackButton
