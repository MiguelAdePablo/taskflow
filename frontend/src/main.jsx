import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext'  // ← NUEVA IMPORTACIÓN
import App from './App.jsx'
import './index.css'

/**
 * Orden de los providers:
 * 1. BrowserRouter (más externo) - para que todo tenga acceso al router
 * 2. AuthProvider - para que todo tenga acceso al estado de autenticación
 * 3. App - nuestra aplicación
 * 
 * ¿Por qué este orden?
 * Porque los providers de React funcionan como capas de una cebolla.
 * El más externo envuelve a todos los demás.
 */
ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <AuthProvider>
        <App />
      </AuthProvider>
    </BrowserRouter>
  </React.StrictMode>,
)