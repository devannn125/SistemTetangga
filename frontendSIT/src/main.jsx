import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import { ConfirmProvider } from './components/ui/ConfirmProvider'
import { ToastProvider } from './components/ui/ToastProvider'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <ToastProvider>
      <ConfirmProvider>
        <App />
      </ConfirmProvider>
    </ToastProvider>
  </StrictMode>,
)
