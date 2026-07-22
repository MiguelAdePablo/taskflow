import { useContext } from 'react'
import { AuthContext } from '../context/AuthContext'

/**
 * Custom hook para acceder al contexto de autenticación.
 */
export function useAuth() {
  const context = useContext(AuthContext)
  
  if (context === null) {
    throw new Error('useAuth debe usarse dentro de un AuthProvider')
  }
  
  return context
}