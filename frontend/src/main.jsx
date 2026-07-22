import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext'
import { SocketProvider } from './context/SocketContext'
import App from './App.jsx'
import './index.css'

// ✅ ORDEN CORRECTO:
// 1. BrowserRouter (siempre primero)
// 2. AuthProvider (provee el token)
// 3. SocketProvider (consume el token de AuthProvider)
// 4. App (usa ambos contextos)

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <AuthProvider>
        <SocketProvider>
          <App />
        </SocketProvider>
      </AuthProvider>
    </BrowserRouter>
  </React.StrictMode>,
)