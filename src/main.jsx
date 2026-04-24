import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import OdSystem from './odsystem.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <OdSystem />
  </StrictMode>,
)
