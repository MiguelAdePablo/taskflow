// import { useContext } from 'react'
// import { SocketContext } from '../context/SocketContext'

// // ============================================================
// // PROPÓSITO: Exponer la instancia de Socket.io, estado de conexión y gestión de notificaciones.
// // CRÍTICO: La validación de contexto nulo garantiza que los componentes que dependen de WebSockets fallen de manera controlada si el SocketProvider no envuelve la aplicación o la ruta específica.
// // ============================================================
// export function useSocket() {
//   const context = useContext(SocketContext)
  
//   if (!context) {
//     throw new Error('useSocket debe ser utilizado dentro de un SocketProvider')
//   }
  
//   return context
// }

import { io } from 'socket.io-client'

// CRÍTICO: Usar la variable de entorno de producción. 
// Si no existe (en local), usa localhost como respaldo.
const SOCKET_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000'

export const useSocket = () => {
  // ... tu lógica de estado ...

  useEffect(() => {
    // CRÍTICO: Configuración robusta para entornos con proxy inverso como Railway
    const socket = io(SOCKET_URL, {
      transports: ['websocket', 'polling'], // Fuerza el intento de WebSocket real
      withCredentials: true,                // Necesario para que el navegador acepte la conexión CORS
      reconnection: true,
      reconnectionAttempts: 5
    })

    // ... resto de tu lógica (listeners, cleanup, etc.) ...

    return () => {
      socket.disconnect()
    }
  }, [])

  // ...
}