import { useState, useEffect } from 'react'  // ← AÑADIDO: useEffect
import { useNavigate, Link } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'

/**
 * Página de inicio de sesión.
 * 
 * Usa el AuthContext para hacer login y redirigir al dashboard.
 */
function Login() {
  // Estados del formulario
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  
  // Obtener funciones del contexto
  const { login, isAuthenticated } = useAuth()
  const navigate = useNavigate()
  
  // Si ya está autenticado, redirigir al dashboard
  useEffect(() => {
    if (isAuthenticated) {
      navigate('/dashboard', { replace: true })
    }
  }, [isAuthenticated, navigate])
  
  /**
   * Manejador del submit del formulario
   */
  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    
    // Validaciones básicas
    if (!email || !password) {
      setError('Email y contraseña son obligatorios')
      setLoading(false)
      return
    }
    
    // Llamar a la función login del contexto
    const result = await login(email, password)
    
    if (result.success) {
      // Login exitoso, redirigir al dashboard
      navigate('/dashboard', { replace: true })
    } else {
      // Login fallido, mostrar error
      setError(result.error)
    }
    
    setLoading(false)
  }
  
  return (
    <div style={{ 
      maxWidth: '400px', 
      margin: '2rem auto', 
      padding: '2rem',
      border: '1px solid #ddd',
      borderRadius: '8px'
    }}>
      <h1 style={{ textAlign: 'center' }}>🔐 Iniciar Sesión</h1>
      
      {error && (
        <div style={{ 
          padding: '1rem', 
          backgroundColor: '#f8d7da', 
          color: '#721c24',
          borderRadius: '4px',
          marginBottom: '1rem'
        }}>
          ❌ {error}
        </div>
      )}
      
      <form onSubmit={handleSubmit}>
        <div style={{ marginBottom: '1rem' }}>
          <label htmlFor="email" style={{ display: 'block', marginBottom: '0.5rem' }}>
            Email:
          </label>
          <input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="tu@email.com"
            disabled={loading}
            style={{ 
              width: '100%', 
              padding: '0.5rem',
              border: '1px solid #ddd',
              borderRadius: '4px'
            }}
          />
        </div>
        
        <div style={{ marginBottom: '1rem' }}>
          <label htmlFor="password" style={{ display: 'block', marginBottom: '0.5rem' }}>
            Contraseña:
          </label>
          <input
            id="password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••"
            disabled={loading}
            style={{ 
              width: '100%', 
              padding: '0.5rem',
              border: '1px solid #ddd',
              borderRadius: '4px'
            }}
          />
        </div>
        
        <button
          type="submit"
          disabled={loading}
          style={{ 
            width: '100%',
            padding: '0.75rem',
            backgroundColor: loading ? '#6c757d' : '#007bff',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: loading ? 'not-allowed' : 'pointer',
            fontSize: '1rem'
          }}
        >
          {loading ? 'Iniciando sesión...' : 'Iniciar Sesión'}
        </button>
      </form>
      
      <p style={{ textAlign: 'center', marginTop: '1rem' }}>
        ¿No tienes cuenta? <Link to="/register">Regístrate aquí</Link>
      </p>
      
      <div style={{ 
        marginTop: '1rem', 
        padding: '1rem', 
        backgroundColor: '#e7f3ff',
        borderRadius: '4px',
        fontSize: '0.9rem'
      }}>
        <strong>💡 Para probar:</strong><br />
        Usa las credenciales que creaste con Thunder Client:<br />
        Email: <code>miguel@example.com</code><br />
        Contraseña: <code>miPassword123</code>
      </div>
    </div>
  )
}

export default Login