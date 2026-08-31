import { useContext } from 'react'
import { SocketContext } from '../context/SocketContext'

// ============================================================
// PROPÓSITO: Exponer la instancia de Socket.io, estado de conexión y gestión de notificaciones.
// CRÍTICO: La validación de contexto nulo garantiza que los componentes que dependen de WebSockets fallen de manera controlada si el SocketProvider no envuelve la aplicación o la ruta específica.
// ============================================================
export function useSocket() {
  const context = useContext(SocketContext)
  
  if (!context) {
    throw new Error('useSocket debe ser utilizado dentro de un SocketProvider')
  }
  
  return context
}

