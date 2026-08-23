import { useState, useEffect } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'

// ============================================================
// PROPÓSITO: Página de inicio de sesión para autenticar usuarios.
// CRÍTICO: Se ha eliminado el bloque de "credenciales de prueba" hardcodeadas. Exponer credenciales en el código fuente o en la UI de producción es una vulnerabilidad de seguridad crítica (CWE-259).
// ============================================================
function Login() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  
  const { login, isAuthenticated } = useAuth()
  const navigate = useNavigate()
  
  useEffect(() => {
    if (isAuthenticated) {
      navigate('/dashboard', { replace: true })
    }
  }, [isAuthenticated, navigate])
  
  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    
    if (!email || !password) {
      setError('Email y contraseña son obligatorios')
      setLoading(false)
      return
    }
    
    try {
      const result = await login(email, password)
      if (result.success) {
        navigate('/dashboard', { replace: true })
      } else {
        setError(result.error || 'Credenciales inválidas')
      }
    } catch (err) {
      setError('Error de conexión con el servidor')
    } finally {
      setLoading(false)
    }
  }
  
  return (
    <div style={{ 
      maxWidth: '400px', 
      margin: '4rem auto', 
      padding: '2rem',
      border: '1px solid var(--border-color, #ddd)',
      borderRadius: '8px',
      backgroundColor: 'var(--bg-primary, #ffffff)',
      boxShadow: 'var(--shadow, 0 4px 6px rgba(0,0,0,0.1))'
    }}>
      <h1 style={{ textAlign: 'center', color: 'var(--text-primary, #212529)', marginBottom: '1.5rem' }}>🔐 Iniciar Sesión</h1>
      
      {error && (
        <div style={{ 
          padding: '1rem', 
          backgroundColor: '#f8d7da', 
          color: '#721c24',
          borderRadius: '4px',
          marginBottom: '1rem',
          border: '1px solid #f5c6cb'
        }}>
          ❌ {error}
        </div>
      )}
      
      <form onSubmit={handleSubmit}>
        <div style={{ marginBottom: '1rem' }}>
          <label htmlFor="email" style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500', color: 'var(--text-primary, #212529)' }}>
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
              padding: '0.75rem',
              border: '1px solid var(--input-border, #ced4da)',
              borderRadius: '4px',
              fontSize: '1rem',
              boxSizing: 'border-box',
              backgroundColor: 'var(--input-bg, #ffffff)',
              color: 'var(--text-primary, #212529)'
            }}
          />
        </div>
        
        <div style={{ marginBottom: '1.5rem' }}>
          <label htmlFor="password" style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500', color: 'var(--text-primary, #212529)' }}>
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
              padding: '0.75rem',
              border: '1px solid var(--input-border, #ced4da)',
              borderRadius: '4px',
              fontSize: '1rem',
              boxSizing: 'border-box',
              backgroundColor: 'var(--input-bg, #ffffff)',
              color: 'var(--text-primary, #212529)'
            }}
          />
        </div>
        
        <button
          type="submit"
          disabled={loading}
          style={{ 
            width: '100%',
            padding: '0.75rem',
            backgroundColor: loading ? 'var(--text-muted, #6c757d)' : 'var(--accent-blue, #007bff)',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: loading ? 'not-allowed' : 'pointer',
            fontSize: '1rem',
            fontWeight: '500',
            transition: 'background-color 0.2s'
          }}
        >
          {loading ? 'Iniciando sesión...' : 'Iniciar Sesión'}
        </button>
      </form>
      
      <p style={{ textAlign: 'center', marginTop: '1.5rem', color: 'var(--text-secondary, #6c757d)' }}>
        ¿No tienes cuenta? <Link to="/register" style={{ color: 'var(--accent-blue, #007bff)', textDecoration: 'none', fontWeight: '500' }}>Regístrate aquí</Link>
      </p>
    </div>
  )
}

export default Login