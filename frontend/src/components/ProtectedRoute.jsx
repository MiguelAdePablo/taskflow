import { Navigate } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'

// ============================================================
// PROPÓSITO: Proteger rutas privadas verificando el estado de autenticación.
// CRÍTICO: Se muestra un estado de carga inicial para evitar redirecciones falsas mientras se valida el token en el contexto.
// ============================================================
function ProtectedRoute({ children }) {
  const { isAuthenticated, loading } = useAuth()
  
  if (loading) {
    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '100vh',
        fontSize: '1.5rem'
      }}>
        ⏳ Cargando...
      </div>
    )
  }
  
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />
  }
  
  return children
}

export default ProtectedRoute