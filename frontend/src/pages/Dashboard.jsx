import { Link } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'

/**
 * Dashboard principal.
 * Muestra información del usuario autenticado.
 */
function Dashboard() {
  const { user, logout } = useAuth()
  
  return (
    <div style={{ padding: '2rem' }}>
      <div style={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center',
        marginBottom: '2rem'
      }}>
        <h1>🏠 Dashboard</h1>
        <div>
          <span style={{ marginRight: '1rem' }}>
            👋 Hola, <strong>{user?.full_name || user?.username}</strong>
          </span>
          <button
            onClick={logout}
            style={{
              padding: '0.5rem 1rem',
              backgroundColor: '#dc3545',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer'
            }}
          >
            Cerrar sesión
          </button>
        </div>
      </div>
      
      <p>Bienvenido a TaskFlow</p>
      
      <hr />
      
      <h2>🔗 Enlaces de prueba (temporales)</h2>
      <nav style={{ display: 'flex', gap: '1rem', marginTop: '1rem' }}>
        <Link to="/projects/1">Ver Proyecto 1</Link>
        <Link to="/projects/2">Ver Proyecto 2</Link>
        <Link to="/tasks/5">Ver Tarea 5</Link>
      </nav>
    </div>
  )
}

export default Dashboard