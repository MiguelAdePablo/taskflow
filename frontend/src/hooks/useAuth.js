import { useContext } from 'react'
import { AuthContext } from '../context/AuthContext'

/**
 * Custom hook para acceder al contexto de autenticación.
 * 
 * ¿Qué es un custom hook?
 * Es una función que empieza con "use" y que usa otros hooks de React.
 * Permite reutilizar lógica entre componentes.
 * 
 * ¿Por qué lo necesitamos?
 * En vez de escribir esto en cada componente:
 *   const context = useContext(AuthContext)
 *   const { user, login, logout } = context
 * 
 * Podemos escribir esto (más limpio):
 *   const { user, login, logout } = useAuth()
 * 
 * @returns {Object} El valor del AuthContext
 */
export function useAuth() {
  const context = useContext(AuthContext)
  
  // Validación de seguridad: si alguien usa useAuth() fuera del AuthProvider
  if (context === null) {
    throw new Error('useAuth debe usarse dentro de un AuthProvider')
  }
  
  return context
}