import { useContext } from 'react'
import { AuthContext } from '../context/AuthContext'

// ============================================================
// PROPÓSITO: Exponer el estado y métodos de autenticación del AuthContext.
// CRÍTICO: Se valida explícitamente que el hook se consuma dentro de un AuthProvider. Esto previene errores silenciosos (undefined) y lanza un fallo temprano y descriptivo durante el desarrollo si la jerarquía de componentes está mal configurada.
// ============================================================
export function useAuth() {
  const context = useContext(AuthContext)
  
  if (!context) {
    throw new Error('useAuth debe ser utilizado dentro de un AuthProvider')
  }
  
  return context
}