import { Navigate } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'

/**
 * Componente que protege rutas privadas.
 * 
 * Ahora usa el AuthContext para verificar si el usuario está autenticado,
 * en lugar de recibir isAuthenticated como prop.
 * 
 * ¿Cómo funciona?
 * - Si está cargando: muestra un spinner
 * - Si NO está autenticado: redirige a /login
 * - Si está autenticado: muestra el componente hijo
 */
function ProtectedRoute({ children }) {
  // Obtener el estado de autenticación del contexto
  const { isAuthenticated, loading } = useAuth()
  
  // Mientras verificamos el token, mostrar un spinner
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
  
  // Si NO está autenticado, redirigir a login
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />
  }
  
  // Si está autenticado, mostrar el componente hijo
  return children
}

export default ProtectedRoute