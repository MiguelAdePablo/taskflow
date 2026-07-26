import { useContext } from 'react'
import { SocketContext } from '../context/SocketContext'

/**
 * Custom hook para acceder al contexto de Socket.io.
 */
export function useSocket() {
  const context = useContext(SocketContext)
  
  if (context === null) {
    throw new Error('useSocket debe usarse dentro de un SocketProvider')
  }
  
  return context
}